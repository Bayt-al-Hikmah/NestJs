import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';


@Injectable()
export class Authorized implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest(); 
    const res = context.switchToHttp().getResponse(); 
    const id =  req.session.get("userId");
    
    if (!id){
       return res.redirect('/login'); 
    } 
    return true;
  }
}

@Injectable()
export class Guest implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();  
    const res = context.switchToHttp().getResponse();  
    const id = req.session.get("userId");
    
    if (!id){
      return true;
    } 
    return res.redirect('/todo');

  }
}