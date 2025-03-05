import { RegisterService } from './register.service';
import { CreateUserDto } from './dto/register.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: RegisterService);
    createUser(createUserDto: CreateUserDto): Promise<import("./register.schema").User>;
}
