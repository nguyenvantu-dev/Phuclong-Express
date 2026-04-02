import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class RolesService {
  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {}

  async findAll(): Promise<{ name: string }[]> {
    try {
      const [roles]: any[] = await this.sequelize.query(`
        SELECT Name FROM dbo.AspNetRoles ORDER BY Name
      `);
      return roles || [];
    } catch (error) {
      console.error('Error getting roles:', error.message);
      return [];
    }
  }
}
