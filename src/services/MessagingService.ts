/**
 * Chrome Extension Messaging Service
 * Handles communication between extension components (popup, background, content scripts)
 */

import { IMessagingService, ChromeMessage, MessageType } from '../types';

export class MessagingService implements IMessagingService {
  private messageHandlers: Set<(message: ChromeMessage) => void> = new Set();

  constructor() {
    this.initializeListener();
  }

  /**
   * Sends a message to the extension runtime
   * @param message The message to send
   */
  sendMessage(message: ChromeMessage): void {
    try {
      chrome.runtime.sendMessage(message, () => {
        if (chrome.runtime.lastError) {
          console.error('Message send error:', chrome.runtime.lastError);
        }
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Sends a message and waits for a response
   * @param message The message to send
   * @returns Promise resolving to the response
   */
  async sendMessageAsync<T>(message: ChromeMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Registers a message handler
   * @param handler Function to handle incoming messages
   */
  onMessage(handler: (message: ChromeMessage) => void): void {
    this.messageHandlers.add(handler);
  }

  /**
   * Unregisters a message handler
   * @param handler Function to remove from handlers
   */
  offMessage(handler: (message: ChromeMessage) => void): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * Sends a message to a specific tab
   * @param tabId Tab ID to send message to
   * @param message The message to send
   */
  async sendToTab<T>(tabId: number, message: ChromeMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Broadcasts a message to all tabs
   * @param message The message to broadcast
   */
  async broadcastToAllTabs(message: ChromeMessage): Promise<void> {
    try {
      const tabs = await new Promise<chrome.tabs.Tab[]>((resolve, reject) => {
        chrome.tabs.query({}, (tabs) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(tabs);
          }
        });
      });

      await Promise.all(
        tabs.map((tab) => {
          if (tab.id) {
            return this.sendToTab(tab.id, message).catch(() => {
              // Ignore errors for tabs that can't receive messages
            });
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }

  /**
   * Initialize the message listener
   */
  private initializeListener(): void {
    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
      // Validate message structure
      if (!this.isValidMessage(message)) {
        console.warn('Received invalid message:', message);
        return false;
      }

      // Handle message with all registered handlers
      this.messageHandlers.forEach((handler) => {
        try {
          handler(message as ChromeMessage);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });

      // Return true to indicate we'll respond asynchronously if needed
      return true;
    });
  }

  /**
   * Validates message structure
   * @param message Message to validate
   * @returns True if message is valid
   */
  private isValidMessage(message: unknown): boolean {
    return (
      typeof message === 'object' &&
      message !== null &&
      'type' in message &&
      typeof (message as any).type === 'string' &&
      Object.values(MessageType).includes((message as any).type)
    );
  }
}

// Singleton instance for the messaging service
let messagingServiceInstance: MessagingService | null = null;

/**
 * Gets the singleton messaging service instance
 * @returns The messaging service instance
 */
export function getMessagingService(): MessagingService {
  if (!messagingServiceInstance) {
    messagingServiceInstance = new MessagingService();
  }
  return messagingServiceInstance;
} 