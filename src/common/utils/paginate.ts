import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { validateUserResponse } from './user.util';
import { User } from '@/database/entities/user.entity';

export async function paginate<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;

  const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
  const dataValidated = data.map((item) => {
    return validateUserResponse(item as unknown as User);
  });
  return {
    data: dataValidated,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
