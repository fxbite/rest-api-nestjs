/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    login() {
        return {
            msg: 'Sign in successfully'
        }
    }

    signup() {
        return {
            msg: 'Sign up successfully'
        }
    }
}
