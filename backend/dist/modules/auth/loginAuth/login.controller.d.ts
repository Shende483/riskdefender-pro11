import { LoginService } from './login.service';
import { LoginUserDto } from './dto/login.dto';
import { Response } from 'express';
export declare class LoginController {
    private loginService;
    constructor(loginService: LoginService);
    login(loginUserDto: LoginUserDto, res: Response): Promise<void>;
}
