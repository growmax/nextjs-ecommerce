import { AxiosInstance, AxiosRequestConfig } from "axios";

export interface QueuedRequestOptions {
  retryAttempts?: number;
  retryDelay?: number;
  priority?: "high" | "normal" | "low";
}

export interface EnhancedQueuedRequest {
  id: string;
  requestConfig: AxiosRequestConfig;
  axiosInstance: AxiosInstance;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  timestamp: number;
  retryAttempts: number;
  maxRetries: number;
  priority: "high" | "normal" | "low";
  retryDelay: number;
}

export class RequestQueueService {
  private static instance: RequestQueueService;
  private queue: EnhancedQueuedRequest[] = [];
  private requestCounter = 0;
  private isProcessing = false;

  private constructor() {}

  public static getInstance(): RequestQueueService {
    if (!RequestQueueService.instance) {
      RequestQueueService.instance = new RequestQueueService();
    }
    return RequestQueueService.instance;
  }

  /**
   * Add a request to the queue for later retry
   */
  public enqueue(
    requestConfig: AxiosRequestConfig,
    axiosInstance: AxiosInstance,
    options: QueuedRequestOptions = {}
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${++this.requestCounter}_${Date.now()}`;

      const queuedRequest: EnhancedQueuedRequest = {
        id: requestId,
        requestConfig,
        axiosInstance,
        resolve,
        reject,
        timestamp: Date.now(),
        retryAttempts: 0,
        maxRetries: options.retryAttempts ?? 3,
        priority: options.priority ?? "normal",
        retryDelay: options.retryDelay ?? 1000,
      };

      this.queue.push(queuedRequest);
      this.sortQueue();

      if (process.env.NODE_ENV === "development") {
      }
    });
  }

  /**
   * Sort queue by priority and timestamp
   */
  private sortQueue(): void {
    const priorityOrder = { high: 3, normal: 2, low: 1 };

    this.queue.sort((a, b) => {
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, sort by timestamp (FIFO)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Process all queued requests after successful token refresh
   */
  public async processQueue(onSuccess: boolean = true): Promise<void> {
    if (this.isProcessing) {
      if (process.env.NODE_ENV === "development") {
      }
      return;
    }

    this.isProcessing = true;
    const queue = [...this.queue];
    this.queue = [];

    if (process.env.NODE_ENV === "development") {
    }

    if (!onSuccess) {
      // Reject all queued requests if token refresh failed
      queue.forEach(request => {
        request.reject(
          new Error("Authentication failed - token refresh unsuccessful")
        );
      });
      this.isProcessing = false;
      return;
    }

    // Process requests with different strategies based on priority
    const highPriorityRequests = queue.filter(r => r.priority === "high");
    const normalPriorityRequests = queue.filter(r => r.priority === "normal");
    const lowPriorityRequests = queue.filter(r => r.priority === "low");

    // Process high priority requests first (parallel)
    if (highPriorityRequests.length > 0) {
      await Promise.allSettled(
        highPriorityRequests.map(request => this.executeRequest(request))
      );
    }

    // Process normal priority requests (parallel with limit)
    if (normalPriorityRequests.length > 0) {
      await this.processRequestsBatch(normalPriorityRequests, 5);
    }

    // Process low priority requests (sequential)
    for (const request of lowPriorityRequests) {
      await this.executeRequest(request);
      // Small delay between low priority requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  /**
   * Process requests in batches to avoid overwhelming the server
   */
  private async processRequestsBatch(
    requests: EnhancedQueuedRequest[],
    batchSize: number = 5
  ): Promise<void> {
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(request => this.executeRequest(request))
      );

      // Small delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }

  /**
   * Execute a single queued request with retry logic
   */
  private async executeRequest(request: EnhancedQueuedRequest): Promise<void> {
    try {
      if (process.env.NODE_ENV === "development") {
      }

      // Execute the request using the stored axios instance
      const response = await request.axiosInstance(request.requestConfig);

      if (process.env.NODE_ENV === "development") {
      }

      request.resolve(response);
    } catch (error) {
      request.retryAttempts++;

      if (request.retryAttempts < request.maxRetries) {
        if (process.env.NODE_ENV === "development") {
        }

        // Wait before retry
        await new Promise(resolve =>
          setTimeout(resolve, request.retryDelay * request.retryAttempts)
        );

        // Re-queue for retry
        this.queue.push(request);
        this.sortQueue();
      } else {
        request.reject(error);
      }
    }
  }

  /**
   * Clear the entire queue (used on logout)
   */
  public clearQueue(): void {
    const queue = [...this.queue];
    this.queue = [];

    queue.forEach(request => {
      request.reject(new Error("Authentication session ended"));
    });

    if (process.env.NODE_ENV === "development") {
    }
  }

  /**
   * Get current queue status
   */
  public getQueueStatus() {
    const priorityCounts = this.queue.reduce(
      (acc, request) => {
        acc[request.priority]++;
        return acc;
      },
      { high: 0, normal: 0, low: 0 }
    );

    return {
      total: this.queue.length,
      isProcessing: this.isProcessing,
      priorityCounts,
      oldestRequest:
        this.queue.length > 0
          ? Date.now() - Math.min(...this.queue.map(r => r.timestamp))
          : 0,
    };
  }

  /**
   * Remove specific request from queue by ID
   */
  public cancelRequest(requestId: string): boolean {
    const index = this.queue.findIndex(r => r.id === requestId);
    if (index !== -1) {
      const request = this.queue[index];
      if (request) {
        this.queue.splice(index, 1);
        request.reject(new Error("Request cancelled"));
        return true;
      }
    }
    return false;
  }

  /**
   * Get queue statistics for monitoring
   */
  public getStatistics() {
    const now = Date.now();
    const queueAge = this.queue.map(r => now - r.timestamp);

    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      averageAge:
        queueAge.length > 0
          ? queueAge.reduce((a, b) => a + b, 0) / queueAge.length
          : 0,
      maxAge: queueAge.length > 0 ? Math.max(...queueAge) : 0,
      priorityBreakdown: this.queue.reduce(
        (acc, request) => {
          acc[request.priority]++;
          return acc;
        },
        { high: 0, normal: 0, low: 0 }
      ),
    };
  }
}

export default RequestQueueService.getInstance();
