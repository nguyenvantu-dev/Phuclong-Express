using System;

namespace OrderMan;

public class DonHang
{
	public int ID { get; set; }

	public string ordernumber { get; set; }

	public string username { get; set; }

	public string usernamesave { get; set; }

	public string linkweb { get; set; }

	public string linkhinh { get; set; }

	public string corlor { get; set; }

	public string size { get; set; }

	public int soluong { get; set; }

	public double dongiaweb { get; set; }

	public double? saleoff { get; set; }

	public double? phuthu { get; set; }

	public double? shipUSA { get; set; }

	public double tax { get; set; }

	public double? cong { get; set; }

	public string loaitien { get; set; }

	public string ghichu { get; set; }

	public double? tygia { get; set; }

	public double? giasauoffUSD { get; set; }

	public double? giasauoffVND { get; set; }

	public double? tiencongUSD { get; set; }

	public double? tiencongVND { get; set; }

	public double? tongtienUSD { get; set; }

	public double? tongtienVND { get; set; }

	public string trangthaiOrder { get; set; }

	public string AdminNote { get; set; }

	public DateTime? ngayveVN { get; set; }

	public DateTime ngaysaveLink { get; set; }

	public DateTime? ngaymuahang { get; set; }

	public int? nam_taichinh { get; set; }

	public string WebsiteName { get; set; }

	public string TenDotHang { get; set; }

	public int YeuCauGuiHang { get; set; }

	public bool DaQuaHanMuc { get; set; }

	public bool LaKhachVip { get; set; }

	public DateTime? NgayYeuCauGuiHang { get; set; }

	public string YeuCauGui_GhiChu { get; set; }

	public double? GuiHang_SoKg { get; set; }

	public double? GuiHang_Tien { get; set; }

	public int? LoaiHangID { get; set; }

	public string TenLoaiHang { get; set; }

	public double? CanHang_SoKg { get; set; }

	public double? CanHang_TienShipVeVN { get; set; }

	public double? CanHang_TienShipTrongNuoc { get; set; }

	public bool HangKhoan { get; set; }

	public string MaSoHang { get; set; }

	public int? QuocGiaID { get; set; }

	public string TenQuocGia { get; set; }

	public string LinkTaiKhoanMang { get; set; }

	public string VungMien { get; set; }
}
