import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { QnaService } from './qna.service';
import { QueryQnaDto, AnswerQnaDto, CreateQnaDto } from './dto/qna.dto';
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
   * Create new Q&A question
   * Matches: HoiDap.cs -> btTaoCauHoi_Click() -> ThemThacMac()
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async createQna(@Body() createDto: CreateQnaDto) {
    return this.qnaService.createQna(createDto.cauHoi);
  }

  /**
   * Answer Q&A question
   * Matches: gvThacMac_RowUpdating() -> CapNhatTraLoiThacMac() in HoiDapAdmin.cs
   */
  @Put(':id/answer')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async deleteQna(@Param('id') id: number) {
    return this.qnaService.deleteQna(id, 'admin');
  }
}
