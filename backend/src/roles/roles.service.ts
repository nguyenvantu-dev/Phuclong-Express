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

  async update(id: string, name: string, nguoiTao = 'system'): Promise<void> {
    const [[role]]: any[] = await this.sequelize.query(
      `SELECT Id, Name FROM dbo.AspNetRoles WHERE Id = '${id}'`,
    );
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    await this.sequelize.query(
      `UPDATE dbo.AspNetRoles SET Name = '${name}' WHERE Id = '${id}'`,
    );
    await this.logAction(nguoiTao, 'Roles:CapNhatRole', 'Chinh sua', id, `RoleId: ${id}; OldName: ${(role as any).Name}; NewName: ${name}`);
  }

  async remove(id: string, nguoiTao = 'system'): Promise<void> {
    const [[role]]: any[] = await this.sequelize.query(
      `SELECT Id, Name FROM dbo.AspNetRoles WHERE Id = '${id}'`,
    );
    await this.sequelize.query(
      `DELETE FROM dbo.AspNetRoles WHERE Id = '${id}'`,
    );
    await this.logAction(nguoiTao, 'Roles:XoaRole', 'Xoa', id, `RoleId: ${id}; Name: ${(role as any)?.Name || ''}`);
  }

  private async logAction(nguoiTao: string, nguon: string, hanhDong: string, doiTuong: string, noiDung: string): Promise<void> {
    try {
      await this.sequelize.query(
        `EXEC SP_Them_SystemLogs @NguoiTao = :nguoiTao, @Nguon = :nguon, @HanhDong = :hanhDong, @DoiTuong = :doiTuong, @NoiDung = :noiDung`,
        { replacements: { nguoiTao, nguon, hanhDong, doiTuong, noiDung } },
      );
    } catch (error: any) {
      console.error('Error logging role action:', error.message);
    }
  }
}
