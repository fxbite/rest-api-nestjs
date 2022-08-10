/*
https://docs.nestjs.com/providers#services
*/

import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { domainToASCII } from 'url';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(dto: AuthDto) {
    // Generate the password hash
    const hash = await argon.hash(dto.password);
    // Save the new user in the db
    try {
        const user = await this.prisma.user.create({
          data: {
            email: dto.email,
            hash,
          }
        });

        delete user.hash

        // Return the saved user
        return user;
    } catch (error) {
        if(error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials Taken')
            }
        }
        throw error
    }
  }

  async signin(dto: AuthDto) {

    // Find the user by email
    const user = await this.prisma.user.findUnique({
        where: {
            email: dto.email
        }
    })

    // If user does not exist throw exception 
    if(!user) throw new ForbiddenException('Credentials Incorrect')

    // Compare password
    const pwMatches = await argon.verify(user.hash, dto.password)

    // If password incorrect throw exception
    if(!pwMatches) {
        throw new ForbiddenException('Credentials Incorrect')
    }
    delete user.hash

    // Send back the user
    return user
  }
}
