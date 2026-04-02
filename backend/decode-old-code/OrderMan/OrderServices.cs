using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Web.Script.Services;
using System.Web.Services;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ToolboxItem(false)]
[ScriptService]
public class OrderServices : WebService
{
	[WebMethod]
	public string HelloWorld()
	{
		return "Hello World";
	}

	[WebMethod]
	public bool ThemDatHangSimple(string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, string loaitien, string ghichu, double tygia, double saleoff, string MaSoHang, bool HangKhoan, int QuocGiaID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			Uri uri = new Uri(linkweb);
			string host = uri.Host;
			string name = base.User.Identity.Name;
			if (string.IsNullOrEmpty(name))
			{
				return false;
			}
			dBConnect.ThemDatHangSimple(host, name, name, linkweb, linkhinh, corlor, size, soluong, dongiaweb, loaitien, ghichu, tygia, saleoff, HangKhoan, null, MaSoHang, QuocGiaID);
			BLL bLL = new BLL();
			string noiDung = bLL.NoiDungDonHangSystemLogs(name, linkweb, linkhinh, corlor, size, soluong, dongiaweb, saleoff, 0.0, 0.0, 0.0, 0.0, loaitien, ghichu, tygia, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", DateTime.Now.ToString("dd/MM/yyyy HH:mm"), "", MaSoHang);
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "OrderServices:ThemDatHangSimple", StringEnum.GetStringValue(HanhDong.ThemMoi), "", noiDung);
			return true;
		}
		catch
		{
			return false;
		}
	}

	[WebMethod]
	public List<TyGia> LayDanhSachTyGia()
	{
		try
		{
			BLL bLL = new BLL();
			return bLL.LayDanhSachTyGia();
		}
		catch
		{
			return null;
		}
	}

	[WebMethod]
	public List<QuocGia> LayDanhSachQuocGia()
	{
		try
		{
			BLL bLL = new BLL();
			return bLL.LayDanhSachQuocGia();
		}
		catch
		{
			return null;
		}
	}

	[WebMethod]
	public string[] TinhTienOrder(int isoluong, double dDongia, double dPhuThu, double dShipUSA, double dSaleOff, double tygia, string Loaitien, double dCong, double dTax, string sUserName)
	{
		BLL bLL = new BLL();
		DonHang donHang = new DonHang();
		double num = (100.0 - dSaleOff) / 100.0 * dDongia * (double)isoluong;
		UserManager manager = new UserManager();
		ApplicationUser applicationUser = manager.FindByName(sUserName);
		GiaTienCong giaTienCong = bLL.LayGiaTienCong(Loaitien, dDongia, applicationUser.KhachBuon);
		double num2 = 0.0;
		double num3;
		if (giaTienCong.TinhTheoPhanTram)
		{
			num3 = num * dCong / 100.0;
			num2 = num3 * tygia;
		}
		else
		{
			num3 = 0.0;
			num2 = giaTienCong.TienCong1Mon * (double)isoluong;
		}
		num += num * 0.01 * dTax;
		num += dShipUSA * (double)isoluong;
		num += dPhuThu * (double)isoluong;
		return new string[6]
		{
			num.ToString("N2"),
			(num * tygia).ToString("N0"),
			num3.ToString("N2"),
			num2.ToString("N0"),
			(num + num3).ToString("N2"),
			EnhancedMath.RoundUp(num * tygia + num2, 0).ToString("N0")
		};
	}

	[WebMethod]
	public string LayPhanTramCongTheoLoaiTien(string Loaitien, double dDongia, string sUserName)
	{
		try
		{
			UserManager manager = new UserManager();
			ApplicationUser applicationUser = manager.FindByName(sUserName);
			BLL bLL = new BLL();
			GiaTienCong giaTienCong = bLL.LayGiaTienCong(Loaitien, dDongia, applicationUser.KhachBuon);
			if (giaTienCong.TinhTheoPhanTram)
			{
				return giaTienCong.TienCong1Mon.ToString();
			}
			return "-1";
		}
		catch (Exception ex)
		{
			return ex.Message;
		}
	}

	[WebMethod]
	public HangCoSanPhanTrang LayDanhSachHangCoSanPhanTrang(string NoiDungTim, int PageSize, int PageNum)
	{
		try
		{
			BLL bLL = new BLL();
			return bLL.LayDanhSachHangCoSanPhanTrang(NoiDungTim, PageSize, PageNum);
		}
		catch
		{
			return null;
		}
	}

	[WebMethod]
	public List<LuocSuTracking> LayDanhSachLuocSuTrackingByNumber(string TrackingNumber)
	{
		try
		{
			BLL bLL = new BLL();
			return bLL.LayDanhSachLuocSuTrackingByNumber(TrackingNumber);
		}
		catch
		{
			return null;
		}
	}
}
