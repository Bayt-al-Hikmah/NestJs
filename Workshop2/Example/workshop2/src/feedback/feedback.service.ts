import { Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';


@Injectable()
export class FeedbackService {
  
  private readonly feedbacks: CreateFeedbackDto[] = []
  addFeedback(feedback: CreateFeedbackDto) {
    this.feedbacks.push(feedback);
   }

  getAllFeedback(): CreateFeedbackDto[] {
  return this.feedbacks;
  }  
}
