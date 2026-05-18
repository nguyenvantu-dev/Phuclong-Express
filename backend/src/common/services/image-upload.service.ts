import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Shared Image Upload Service.
 *
 * Ports the v1 (ASP.NET) upload pattern used across:
 *  - EditOrderDetail.cs, QLDatHang_Them.cs (orders)
 *  - Tracking_ThemSua.cs, SuaTracking.cs (tracking detail)
 *  - HangKhoan_Them.cs (purchased items)
 *  - HangCoSan_Them.cs (in-stock items — folded into /imgLink/YYYYMM/)
 *
 * Behavior matches v1: UUID filename + YYYYMM subfolder + resize to 640x480
 * preserving aspect ratio, no enlargement.
 */
@Injectable()
export class ImageUploadService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'imgLink');

  async upload(file: Express.Multer.File): Promise<{ linkHinh: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const targetDir = path.join(this.uploadDir, yearMonth);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalname || '.jpg').toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(targetDir, filename);

    await sharp(file.buffer)
      .resize(640, 480, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(filepath);

    return { linkHinh: `/imgLink/${yearMonth}/${filename}` };
  }
}
