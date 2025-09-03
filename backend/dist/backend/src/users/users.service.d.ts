import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    findByOrganization(organizationId: string): Promise<User[]>;
    findByRole(role: string): Promise<User[]>;
    findByEmail(email: string): Promise<User | null>;
    updateLastLogin(id: string): Promise<void>;
}
