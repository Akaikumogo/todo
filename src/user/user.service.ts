// src/user/user.service.ts

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private static timerIntervals = new Map<string, NodeJS.Timeout>();
  private readonly externalEndpoint = 'http://185.217.131.96:5151/rooms/submit';

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  /**
   * Find a user by username. Throws NotFoundException if not exists.
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException(`User not found: ${username}`);
    }
    return user;
  }

  /**
   * Retrieve paginated list of users.
   */
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.userModel.countDocuments().exec(),
    ]);
    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
 * Create a new user with hashed password. Throws BadRequestException if username exists.
 */
async create(username: string, password: string): Promise<User> {
  // Check uniqueness
  const existing = await this.userModel.findOne({ username }).exec();
  if (existing) {
    throw new BadRequestException(`Username already exists: ${username}`);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

    // Build creation object with defaults for optional fields
    const toCreate: Partial<User> = {
      username,
      password: hashedPassword,
      waterDepth: 0,
      height: 0,
      totalLitres: 0,
      totalElectricity: 0,
      motorState: 'off',
      timerRemaining: '00:00',
      lastTimerTime: undefined,
      lastHeartbeat: undefined,
    };

    const user = new this.userModel(toCreate);
    return user.save();
  }

  /**
   * Update a user partially by username.
   * - Applies only fields present in updateDto.
   * - Notifies external service with updated fields.
   * - Manages timer countdown if timerRemaining changed.
   */
  async updateUser(username: string, updateDto: UpdateUserDto): Promise<User> {
    // Ensure user exists
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException(`User not found: ${username}`);
    }

    // Build Mongoose update object
    const updateQuery: UpdateQuery<UserDocument> = {};

    if (updateDto.password) {
      updateQuery.password = await bcrypt.hash(updateDto.password, 10);
    }
    if (updateDto.waterDepth !== undefined) {
      updateQuery.waterDepth = updateDto.waterDepth;
    }
    if (updateDto.height !== undefined) {
      updateQuery.height = updateDto.height;
    }
    if (updateDto.totalLitres !== undefined) {
      updateQuery.totalLitres = updateDto.totalLitres;
    }
    if (updateDto.totalElectricity !== undefined) {
      updateQuery.totalElectricity = updateDto.totalElectricity;
    }
    if (updateDto.motorState !== undefined) {
      updateQuery.motorState = updateDto.motorState; // must be 'off' or 'on'
    }
    if (updateDto.timerRemaining !== undefined) {
      updateQuery.timerRemaining = updateDto.timerRemaining;
    }
    if (updateDto.lastTimerTime !== undefined) {
      updateQuery.lastTimerTime = new Date(updateDto.lastTimerTime);
    }
    if (updateDto.lastHeartbeat !== undefined) {
      updateQuery.lastHeartbeat = new Date(updateDto.lastHeartbeat);
    }

    // Perform the database update
    const updatedUser = await this.userModel
      .findOneAndUpdate({ username }, updateQuery, { new: true })
      .exec();

    this.logger.log(`Updated user ${username} with: ${JSON.stringify(updateQuery)}`);

    // Notify external service of the update
    this.notifyExternalService(username, updateQuery).catch((err) =>
      this.logger.error(`External notify failed for ${username}: ${err.message}`),
    );

    // If timerRemaining was set, handle countdown logic
    if (updateDto.timerRemaining) {
      await this.handleTimerCountdown(username, updateDto.timerRemaining);
    }

    return updatedUser as User;
  }

  /**
   * Delete a user by username. Also clears any running timer.
   * Throws NotFoundException if user does not exist.
   */
  async deleteUser(username: string): Promise<void> {
    const result = await this.userModel.deleteOne({ username }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User not found: ${username}`);
    }
    // Clear any active timer for this user
    if (UserService.timerIntervals.has(username)) {
      clearInterval(UserService.timerIntervals.get(username));
      UserService.timerIntervals.delete(username);
      this.logger.log(`Cleared timer for deleted user ${username}`);
    }
  }

  /**
   * Update heartbeat timestamp for a user (called e.g. on periodic ping).
   * Throws NotFoundException if user does not exist.
   */
  async updateHeartbeat(username: string): Promise<User> {
    const now = new Date();
    const updated = await this.userModel
      .findOneAndUpdate({ username }, { lastHeartbeat: now }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`User not found: ${username}`);
    }
    this.logger.log(`Updated heartbeat for ${username} at ${now.toISOString()}`);
    return updated;
  }

  /**
   * Send a JSON payload to the external service at /rooms/submit.
   * Payload contains:
   *   { topic: "esp32/<username>", data: "<stringified JSON last update>" }
   */
  private async notifyExternalService(
    username: string,
    data: UpdateQuery<UserDocument>,
  ): Promise<void> {
    try {
      const payload = {
        topic: `esp32/${username}`,
        data: JSON.stringify(data),
      };
      const response = await axios.post(this.externalEndpoint, payload);
      this.logger.log(`External submit success for ${username}: ${response.status}`);
    } catch (err) {
      throw new Error(`External submit failed: ${err.message}`);
    }
  }

  /**
   * Manage timer countdown logic when timerRemaining is set or updated.
   * - Validates HH:MM format.
   * - Clears existing interval if present.
   * - Updates lastTimerTime in DB immediately.
   * - Starts a setInterval to decrement each second.
   * - On each minute tick or last 60s every 10s, updates DB and notifies external service.
   * - On completion, sets motorState to 'off', timerRemaining to '00:00', updates lastTimerTime, and notifies external service.
   */
  private async handleTimerCountdown(username: string, timerHHMM: string): Promise<void> {
    // 1) Validate format HH:MM
    if (!this.isValidTimerHHMM(timerHHMM)) {
      throw new BadRequestException(`Invalid timer format: ${timerHHMM}. Expected HH:MM`);
    }

    // 2) Convert to total seconds
    const totalSeconds = this.parseHHMMtoSeconds(timerHHMM);
    if (totalSeconds <= 0) {
      this.logger.log(`Timer is zero; no countdown for ${username}`);
      // Ensure DB is synced: motor off, timer 00:00, lastTimerTime = now
      const now = new Date();
      await this.userModel.updateOne(
        { username },
        {
          motorState: 'off',
          timerRemaining: '00:00',
          lastTimerTime: now,
        },
      );
      return;
    }

    // 3) Clear existing interval if any
    if (UserService.timerIntervals.has(username)) {
      this.logger.log(`Clearing existing timer for ${username}`);
      clearInterval(UserService.timerIntervals.get(username));
      UserService.timerIntervals.delete(username);
    }

    this.logger.log(`Starting timer for ${username}: ${timerHHMM} (${totalSeconds}s)`);

    // 4) Immediately update lastTimerTime in DB
    const startTime = new Date();
    await this.userModel.updateOne(
      { username },
      {
        lastTimerTime: startTime,
      },
    );

    let remaining = totalSeconds;

    // 5) setInterval for countdown every second
    const interval = setInterval(async () => {
      try {
        remaining--;

        // a) If timer completed
        if (remaining < 0) {
          this.logger.log(`Timer completed for ${username}`);
          clearInterval(interval);
          UserService.timerIntervals.delete(username);

          const completionTime = new Date();
          // Update DB: motor off, timerRemaining '00:00', lastTimerTime
          await this.userModel.updateOne(
            { username },
            {
              motorState: 'off',
              timerRemaining: '00:00',
              lastTimerTime: completionTime,
            },
          );

          // Notify external service of completion
          await this.notifyExternalService(username, {
            motorState: 'off',
            timerRemaining: '00:00',
            lastTimerTime: completionTime,
          });
          return;
        }

        // b) Decrement logic: update at each minute tick or every 10s in last minute
        if (remaining % 60 === 0 || (remaining <= 60 && remaining % 10 === 0)) {
          const formatted = this.formatSecondsToHHMM(remaining);
          const updateTime = new Date();

          // Update DB with new timerRemaining & lastTimerTime
          await this.userModel.updateOne(
            { username },
            {
              timerRemaining: formatted,
              lastTimerTime: updateTime,
            },
          );

          // Notify external service for minute tick or last-minute interval
          await this.notifyExternalService(username, {
            timerRemaining: formatted,
            lastTimerTime: updateTime,
          });
          this.logger.log(`Timer update for ${username}: ${formatted} (${remaining}s left)`);
        }
      } catch (err) {
        this.logger.error(`Timer interval error for ${username}: ${err.message}`);
        clearInterval(interval);
        UserService.timerIntervals.delete(username);
      }
    }, 1000);

    UserService.timerIntervals.set(username, interval);

    // 6) Send initial timer start notification
    await this.notifyExternalService(username, {
      timerRemaining: timerHHMM,
      lastTimerTime: startTime,
    });
  }

  /**
   * Validate HH:MM format (00 ≤ HH ≤ 23, 00 ≤ MM ≤ 59).
   */
  private isValidTimerHHMM(str: string): boolean {
    const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(str);
  }

  /**
   * Convert "HH:MM" string to total seconds.
   */
  private parseHHMMtoSeconds(str: string): number {
    const [h, m] = str.split(':').map((p) => parseInt(p, 10));
    return h * 3600 + m * 60;
  }

  /**
   * Format seconds into "HH:MM" (caps hours up to 23, minutes up to 59).
   */
  private formatSecondsToHHMM(sec: number): string {
    if (sec <= 0) {
      return '00:00';
    }
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
}
