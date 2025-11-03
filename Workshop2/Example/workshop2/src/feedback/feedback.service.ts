import { Injectable } from '@nestjs/common';

export interface Feedback {
  name: string;
  email: string;
  message: string;
}

@Injectable()
export class FeedbackService {
  private readonly feedbacks: Feedback[] = [];

  addFeedback(feedback: Feedback) {
    this.feedbacks.push(feedback);
  }

  getAllFeedback(): Feedback[] {
    return this.feedbacks;
  }
}