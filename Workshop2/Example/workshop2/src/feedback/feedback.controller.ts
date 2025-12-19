import { Controller, Get, Post, Render, Body, Redirect, UseGuards,Res  } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FastifyCsrfGuard } from './fastify-csrf.guard';
import {  type FastifyReply } from 'fastify';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}
  
  @Get()
  @Render('feedback/form')
  async showFeedbackForm(@Res() res: FastifyReply) {
    const csrfToken = await (res as any).generateCsrf();
    return { csrfToken };
  }
  
  @Post()
  @UseGuards(FastifyCsrfGuard)
  @Redirect('feedback/feedbacks')
  handleFeedbackSubmission(@Body() body: CreateFeedbackDto) {
   this.feedbackService.addFeedback(body);
  }

  @Get('feedbacks')
  @Render('feedback/feedbacks')
  showFeedbackList() {
    const feedback_list = this.feedbackService.getAllFeedback();
    return { feedback_list: feedback_list };
  }
}