import { Model } from 'mongoose';
import { User } from './register.schema';
import { CreateUserDto } from './dto/register.dto';
export declare class RegisterService {
    private userModel;
    constructor(userModel: Model<User>);
    createUser(createUserDto: CreateUserDto): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
}
