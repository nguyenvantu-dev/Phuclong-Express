import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { QnaService } from './qna.service';
import { QueryQnaDto, AnswerQnaDto } from './dto/qna.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Q&A Controller
 *
 * Handles Q&A management operations
 */
@Controller('qna')
@UseGuards(JwtAuthGuard)
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}

  /**
   * Get Q&A list with filters
   * Matches: LoadDanhSachThacMac() in HoiDapAdmin.cs
   */
  @Get()
  async getQnaList(@Query() query: QueryQnaDto) {
    return this.qnaService.getQnaList(
      query.username,
      query.daTraLoi,
      query.page,
      query.limit,
    );
  }

  /**
   * Answer Q&A question
   * Matches: gvThacMac_RowUpdating() -> CapNhatTraLoiThacMac() in HoiDapAdmin.cs
   */
  @Put(':id/answer')
  async answerQna(
    @Param('id') id: number,
    @Body() answerDto: AnswerQnaDto,
  ) {
    return this.qnaService.answerQna(
      id,
      answerDto.traLoi,
      'admin',
    );
  }

  /**
   * Delete Q&A question
   * Matches: gvThacMac_RowDeleting() -> XoaThacMac() in HoiDapAdmin.cs
   */
  @Delete(':id')
  async deleteQna(@Param('id') id: number) {
    return this.qnaService.deleteQna(id, 'admin');
  }
}
