import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class RolesService {
  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {}

  async findAll(): Promise<{ Id: string; Name: string }[]> {
    try {
      const [roles]: any[] = await this.sequelize.query(`
        SELECT Id, Name FROM dbo.AspNetRoles ORDER BY Name
      `);
      return roles || [];
    } catch (error: any) {
      console.error('Error getting roles:', error.message);
      return [];
    }
  }

  async update(id: string, name: string): Promise<void> {
    const [[role]]: any[] = await this.sequelize.query(
      `SELECT Id FROM dbo.AspNetRoles WHERE Id = '${id}'`,
    );
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    await this.sequelize.query(
      `UPDATE dbo.AspNetRoles SET Name = '${name}' WHERE Id = '${id}'`,
    );
  }

  async remove(id: string): Promise<void> {
    await this.sequelize.query(
      `DELETE FROM dbo.AspNetRoles WHERE Id = '${id}'`,
    );
  }
}
