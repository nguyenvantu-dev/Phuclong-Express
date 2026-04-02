using System;

namespace OrderMan;

public class LoHang
{
	public int LoHangID { get; set; }

	public string UserName { get; set; }

	public DateTime NgayLoHang { get; set; }

	public string TenLoHang { get; set; }

	public string LoaiTien { get; set; }

	public double? TyGia { get; set; }

	public DateTime? NgayDenDuKien { get; set; }

	public DateTime? NgayDenThucTe { get; set; }

	public string NguoiTao { get; set; }

	public DateTime NgayTao { get; set; }

	public double? TienLoHangA { get; set; }

	public double? TienPhiHaiQuanB { get; set; }

	public double? TongTienLoHang { get; set; }
}
