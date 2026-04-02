using Microsoft.AspNet.Identity.EntityFramework;

namespace OrderMan.Models;

public class ApplicationUser : IdentityUser
{
	public string HoTen { get; set; }

	public string DiaChi { get; set; }

	public string TinhThanh { get; set; }

	public string SoTaiKhoan { get; set; }

	public string HinhThucNhanHang { get; set; }

	public bool KhachBuon { get; set; }

	public string LinkTaiKhoanMang { get; set; }

	public string VungMien { get; set; }
}
