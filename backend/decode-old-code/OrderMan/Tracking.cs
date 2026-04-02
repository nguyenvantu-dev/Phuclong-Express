using System;

namespace OrderMan;

public class Tracking
{
	public int TrackingID { get; set; }

	public string UserName { get; set; }

	public string TrackingNumber { get; set; }

	public string OrderNumber { get; set; }

	public DateTime? NgayDatHang { get; set; }

	public int? NhaVanChuyenID { get; set; }

	public string TenNhaVanChuyen { get; set; }

	public int? QuocGiaID { get; set; }

	public string TenQuocGia { get; set; }

	public DateTime? NgayLoHang { get; set; }

	public string TenLoHang { get; set; }

	public string TinhTrang { get; set; }

	public string GhiChu { get; set; }

	public string Kien { get; set; }

	public string Mawb { get; set; }

	public string Hawb { get; set; }

	public string NguoiTao { get; set; }

	public DateTime NgayTao { get; set; }

	public string LinkTaiKhoanMang { get; set; }
}
