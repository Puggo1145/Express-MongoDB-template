// This file is used to store types

import { JwtPayload } from 'jsonwebtoken';

export interface decodedTokenDataType extends JwtPayload {
    id: string,
    iat: number,
    exp: number
}