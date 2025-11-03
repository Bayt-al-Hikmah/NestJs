import {ValidationPipe, Controller, Get, Post,Res, Render, Body, Redirect,UseGuards } from '@nestjs/common';
import { FeedbackService, type Feedback } from './feedback.service';
import { FastifyCsrfGuard } from './fastify-csrf.guard';
import type{ FastifyReply} from 'fastify';
import  { FeedbackDto } from './dto/feedback.dto';

@Controller('feedback')
export class FeedbackController {
	constructor(private readonly feedbackService: FeedbackService) {}
	
	@Get()
	@Render('feedback/form')
	async showFeedbackForm(@Res({ passthrough: true }) res: FastifyReply) {
		const csrfToken = await res.generateCsrf();
	    return { csrfToken };
	}
	
	@Post()
	@UseGuards(FastifyCsrfGuard)
	@Redirect('feedback/feedbacks')
	handleFeedbackSubmission(@Body(ValidationPipe) body: FeedbackDto) {
		this.feedbackService.addFeedback(body);
	}
	
	@Get('feedbacks')
	@Render('feedback/feedbacks')
	showFeedbackList() {
		const feedback_list = this.feedbackService.getAllFeedback();
		return { feedback_list: feedback_list };
	}

}