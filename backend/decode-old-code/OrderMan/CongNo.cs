using System;

namespace OrderMan;

public class CongNo
{
	public int CongNo_ID { get; set; }

	public string NoiDung { get; set; }

	public DateTime? NgayGhiNo { get; set; }

	public double? DR { get; set; }

	public double? CR { get; set; }

	public string UserName { get; set; }

	public bool Status { get; set; }

	public string StatusText { get; set; }

	public string Ghichu { get; set; }

	public int? LoHangID { get; set; }

	public string TenLoHang { get; set; }

	public string NguoiTao { get; set; }

	public string NguoiCapNhatCuoi { get; set; }

	public DateTime? NgayCapNhatCuoi { get; set; }

	public int LoaiPhatSinh { get; set; }

	public string LoaiPhatSinhText { get; set; }
}
