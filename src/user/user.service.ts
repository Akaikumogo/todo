// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

@Injectable()
export class UserService {
  // Store timer interval reference in a Map to prevent memory leaks
  // and allow proper cleanup when a new timer is set
  private static timerIntervals = new Map<string, NodeJS.Timeout>();
  
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    return user || undefined;
  }

  async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(),
    ]);
    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async create(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hashedPassword });
    return user.save();
  }

  async updateUser(
    username: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ username }, updateData, { new: true })
      .exec();
    console.log(updateData,"load data from esp32");
    
    if (updatedUser) {
      try {
        await axios.post('http://185.217.131.96:5151/rooms/submit', {
          topic: `esp32/${updatedUser.username}`,
          data: JSON.stringify(updateData),
        });
      } catch (error) {
        console.error('Error sending data to external service:', error.message);
      }
    }


    
    if (updateData.timer) {
      try {
        // Validate timer format
        if (!this.isValidTimerFormat(updateData.timer)) {
          console.error(`Invalid timer format: ${updateData.timer}. Expected format: HH:MM`);
          throw new Error('Invalid timer format. Expected format: HH:MM');
        }
        
        const totalSeconds = this.parseTimerHHMM(updateData.timer);
        
        // Don't proceed if timer is set to 00:00
        if (totalSeconds <= 0) {
          console.log(`Timer set to zero for user ${username}, not starting countdown`);
          return updatedUser;
        }
        
        let remaining = totalSeconds;
        
        // Clear any existing timer for this user
        if (UserService.timerIntervals.has(username)) {
          console.log(`Clearing existing timer for user ${username}`);
          clearInterval(UserService.timerIntervals.get(username));
          UserService.timerIntervals.delete(username);
        }
        
        console.log(`Starting timer for user ${username}: ${updateData.timer} (${totalSeconds} seconds)`);
        
        // Get current time in ISO format
        const currentTime = new Date().toISOString();
        
        // Update database immediately with the new timer value and lastTimerTime
        await this.userModel.updateOne(
          { username }, 
          { 
            timer: updateData.timer,
            lastTimerTime: currentTime 
          }
        );
        
        // Set up the interval for countdown
        const interval = setInterval(async () => {
          try {
            // Check if timer should end
            if (remaining <= 0) {
              console.log(`Timer completed for user ${username}`);
              
              // Clean up interval
              clearInterval(interval);
              UserService.timerIntervals.delete(username);
              
              // Get current time in ISO format
              const completionTime = new Date().toISOString();
              
              // Update user state in database
              await this.userModel.updateOne(
                { username },
                { 
                  motorState: 'off', 
                  timer: '00:00',
                  lastTimerTime: completionTime 
                },
              );
              
              // Send notification to external service
              try {
                const response = await axios.post('http://185.217.131.96:5151/rooms/submit', {
                  topic: `esp32/${username}`,
                  data: JSON.stringify({ 
                    motorState: 'off', 
                    timer: '00:00',
                    lastTimerTime: completionTime 
                  }),
                });
                console.log(`Notification sent to external service for user ${username}`, response.status);
              } catch (error) {
                console.error(`Error sending timer completion to external service for user ${username}:`, error.message);
              }
              return;
            }
            
            // Decrement timer
            remaining--;
            
            // Format and update timer display every minute (to reduce database writes)
            if (remaining % 60 === 0 || remaining <= 60) {
              const timerString = this.formatTimerHHMM(remaining);
              console.log(`Timer update for user ${username}: ${timerString} (${remaining} seconds remaining)`);
              // Get current update time
              const updateTime = new Date().toISOString();
              
              await this.userModel.updateOne(
                { username }, 
                { 
                  timer: timerString,
                  lastTimerTime: updateTime 
                }
              );
              
              // For the last minute, update more frequently
              if (remaining <= 60 && remaining % 10 === 0) {
                try {
                  await axios.post('http://185.217.131.96:5151/rooms/submit', {
                    topic: `esp32/${username}`,
                    data: JSON.stringify({ 
                      timer: timerString,
                      lastTimerTime: updateTime 
                    }),
                  });
                } catch (error) {
                  console.error(`Error sending timer update to external service for user ${username}:`, error.message);
                }
              }
            }
          } catch (error) {
            console.error(`Error in timer interval for user ${username}:`, error.message);
            clearInterval(interval);
            UserService.timerIntervals.delete(username);
          }
        }, 1000);
        
        // Store the interval reference
        UserService.timerIntervals.set(username, interval);
        
        // Send initial timer value to external service
        try {
          await axios.post('http://185.217.131.96:5151/rooms/submit', {
            topic: `esp32/${username}`,
            data: JSON.stringify({ 
              timer: updateData.timer,
              lastTimerTime: currentTime 
            }),
          });
        } catch (error) {
          console.error(`Error sending initial timer to external service for user ${username}:`, error.message);
        }
      } catch (error) {
        console.error(`Failed to set timer for user ${username}:`, error.message);
      }
    }
    return updatedUser;
  }

  async deleteUser(username: string): Promise<void> {
    await this.userModel.deleteOne({ username });
  }
  
  /**
   * Updates the heartbeat timestamp for a user
   * @param username Username to update heartbeat for
   * @returns Updated user or null if user not found
   */
  async updateHeartbeat(username: string): Promise<User | null> {
    try {
      const currentTime = new Date().toISOString();
      
      // Update the user's lastHeartbeat field
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { username }, 
          { lastHeartbeat: currentTime },
          { new: true }
        )
        .exec();
      
      if (!updatedUser) {
        console.log(`User not found for heartbeat update: ${username}`);
        return null;
      }
      
      console.log(`Updated heartbeat for user ${username} at ${currentTime}`);
      return updatedUser;
    } catch (error) {
      console.error(`Error updating heartbeat for user ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Validates if a string is in the correct HH:MM format
   * @param timer Timer string to validate
   * @returns True if the format is valid
   */
  private isValidTimerFormat(timer: string): boolean {
    // Check if the string matches the HH:MM pattern
    const regex = /^([0-9]{1,2}):([0-9]{1,2})$/;
    if (!regex.test(timer)) {
      return false;
    }
    
    // Extract hours and minutes and validate ranges
    const [hours, minutes] = timer.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }

  /**
   * Converts a timer string in HH:MM format to total seconds
   * @param timer Timer string in HH:MM format
   * @returns Total seconds
   */
  private parseTimerHHMM(timer: string): number {
    if (!this.isValidTimerFormat(timer)) {
      return 0;
    }
    
    const [hours, minutes] = timer.split(':').map(Number);
    return hours * 3600 + minutes * 60;
  }

  /**
   * Formats a total seconds value to HH:MM format
   * @param seconds Total seconds to format
   * @returns Formatted time string in HH:MM format
   */
  private formatTimerHHMM(seconds: number): string {
    if (seconds < 0) {
      return '00:00';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
