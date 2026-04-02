using System;
using System.Collections.Generic;
using System.Data;

namespace OrderMan;

public class BLL
{
	protected List<TyGia> RtnTyGia(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<TyGia> list = new List<TyGia>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = ds.Tables[0].Rows[i];
				TyGia tyGia = new TyGia();
				tyGia.Name = dataRow["Name"].ToString();
				tyGia.TyGiaVND = Convert.ToDouble(dataRow["TyGiaVND"]);
				tyGia.CongShipVeVN = Convert.ToDouble(dataRow["CongShipVeVN"]);
				list.Add(tyGia);
			}
			return list;
		}
		return null;
	}

	public List<TyGia> LayDanhSachTyGia()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachTyGia();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnTyGia(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected List<QuocGia> RtnQuocGia(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<QuocGia> list = new List<QuocGia>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = ds.Tables[0].Rows[i];
				QuocGia quocGia = new QuocGia();
				quocGia.QuocGiaID = ((dataRow["QuocGiaID"] != DBNull.Value) ? Convert.ToInt32(dataRow["QuocGiaID"]) : 0);
				quocGia.TenQuocGia = ((dataRow["TenQuocGia"] == DBNull.Value) ? "" : dataRow["TenQuocGia"].ToString());
				quocGia.PhiShipVeVN = ((dataRow["PhiShipVeVN"] != DBNull.Value) ? Convert.ToInt32(dataRow["PhiShipVeVN"]) : 0);
				list.Add(quocGia);
			}
			return list;
		}
		return null;
	}

	public List<QuocGia> LayDanhSachQuocGia()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachQuocGia();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnQuocGia(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected List<Website> RtnWebsite(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<Website> list = new List<Website>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = ds.Tables[0].Rows[i];
				Website website = new Website();
				website.ID = Convert.ToInt32(dataRow["ID"]);
				website.WebsiteName = dataRow["WebsiteName"].ToString();
				website.GhiChu = ((dataRow["GhiChu"] == DBNull.Value) ? "" : dataRow["GhiChu"].ToString());
				list.Add(website);
			}
			return list;
		}
		return null;
	}

	public List<Website> LayDanhSachWebsite()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachWebsite();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnWebsite(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected ThongTinWeb RtnRowThongTinWeb(DataRow dtRow)
	{
		try
		{
			ThongTinWeb thongTinWeb = new ThongTinWeb();
			thongTinWeb.ID = Convert.ToInt32(dtRow["ID"]);
			thongTinWeb.TenThongTin = dtRow["TenThongTin"].ToString();
			thongTinWeb.NoiDungThongTin = ((dtRow["NoiDungThongTin"] == DBNull.Value) ? "" : dtRow["NoiDungThongTin"].ToString());
			return thongTinWeb;
		}
		catch
		{
			return null;
		}
	}

	protected List<ThongTinWeb> RtnThongTinWeb(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<ThongTinWeb> list = new List<ThongTinWeb>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowThongTinWeb(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<ThongTinWeb> LayDanhSachThongTinWeb()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachThongTinWeb();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnThongTinWeb(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public ThongTinWeb LayThongTinWebByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayThongTinWebByID(ID);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowThongTinWeb(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected ThacMac RtnRowThacMac(DataRow dtRow)
	{
		try
		{
			ThacMac thacMac = new ThacMac();
			thacMac.ID = Convert.ToInt32(dtRow["ID"]);
			thacMac.username = dtRow["username"].ToString();
			thacMac.CauHoi = dtRow["CauHoi"].ToString();
			thacMac.TraLoi = ((dtRow["TraLoi"] == DBNull.Value) ? "" : dtRow["TraLoi"].ToString());
			thacMac.NgayTao = (DateTime)dtRow["NgayTao"];
			thacMac.NgayTraLoi = ((dtRow["NgayTraLoi"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayTraLoi"]));
			return thacMac;
		}
		catch
		{
			return null;
		}
	}

	protected List<ThacMac> RtnThacMac(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<ThacMac> list = new List<ThacMac>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowThacMac(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public ThacMacPhanTrang LayDanhSachThacMac(string username, int DaTraLoi, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachThacMac(username, DaTraLoi, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				return new ThacMacPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachThacMac = RtnThacMac(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected DonHang RtnRowDonHang(DataRow dtRow)
	{
		try
		{
			DonHang donHang = new DonHang();
			donHang.ID = Convert.ToInt32(dtRow["ID"]);
			donHang.ordernumber = ((dtRow["ordernumber"] == DBNull.Value) ? "" : dtRow["ordernumber"].ToString());
			donHang.username = dtRow["username"].ToString();
			donHang.usernamesave = dtRow["usernamesave"].ToString();
			donHang.linkweb = ((dtRow["linkweb"] == DBNull.Value) ? "" : dtRow["linkweb"].ToString());
			donHang.linkhinh = ((dtRow["linkhinh"] == DBNull.Value) ? "" : dtRow["linkhinh"].ToString());
			donHang.corlor = ((dtRow["corlor"] == DBNull.Value) ? "" : dtRow["corlor"].ToString());
			donHang.size = ((dtRow["size"] == DBNull.Value) ? "" : dtRow["size"].ToString());
			donHang.soluong = Convert.ToInt32(dtRow["soluong"]);
			donHang.dongiaweb = Convert.ToDouble(dtRow["dongiaweb"]);
			donHang.saleoff = ((dtRow["saleoff"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["saleoff"])));
			donHang.phuthu = ((dtRow["phuthu"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["phuthu"])));
			donHang.shipUSA = ((dtRow["shipUSA"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["shipUSA"])));
			donHang.tax = ((dtRow["tax"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["tax"]));
			donHang.cong = ((dtRow["cong"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["cong"])));
			donHang.loaitien = ((dtRow["loaitien"] == DBNull.Value) ? "" : dtRow["loaitien"].ToString());
			donHang.ghichu = ((dtRow["ghichu"] == DBNull.Value) ? "" : dtRow["ghichu"].ToString());
			donHang.tygia = ((dtRow["tygia"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["tygia"])));
			donHang.giasauoffUSD = ((dtRow["giasauoffUSD"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["giasauoffUSD"])));
			donHang.giasauoffVND = ((dtRow["giasauoffVND"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["giasauoffVND"])));
			donHang.tiencongUSD = ((dtRow["tiencongUSD"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["tiencongUSD"])));
			donHang.tiencongVND = ((dtRow["tiencongVND"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["tiencongVND"])));
			donHang.tongtienUSD = ((dtRow["tongtienUSD"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["tongtienUSD"])));
			donHang.tongtienVND = ((dtRow["tongtienVND"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["tongtienVND"])));
			donHang.trangthaiOrder = ((dtRow["trangthaiOrder"] == DBNull.Value) ? "" : dtRow["trangthaiOrder"].ToString());
			donHang.AdminNote = ((dtRow["AdminNote"] == DBNull.Value) ? "" : dtRow["AdminNote"].ToString());
			donHang.ngayveVN = ((dtRow["ngayveVN"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["ngayveVN"]));
			donHang.ngaysaveLink = (DateTime)dtRow["ngaysaveLink"];
			donHang.ngaymuahang = ((dtRow["ngaymuahang"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["ngaymuahang"]));
			donHang.nam_taichinh = ((dtRow["nam_taichinh"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["nam_taichinh"])));
			donHang.WebsiteName = ((dtRow["WebsiteName"] == DBNull.Value) ? "" : dtRow["WebsiteName"].ToString());
			donHang.TenDotHang = ((dtRow["TenDotHang"] == DBNull.Value) ? "" : dtRow["TenDotHang"].ToString());
			donHang.YeuCauGuiHang = ((dtRow["YeuCauGuiHang"] != DBNull.Value) ? Convert.ToInt32(dtRow["YeuCauGuiHang"]) : 0);
			donHang.DaQuaHanMuc = dtRow["DaQuaHanMuc"] != DBNull.Value && Convert.ToBoolean(dtRow["DaQuaHanMuc"]);
			donHang.LaKhachVip = dtRow["LaKhachVip"] != DBNull.Value && Convert.ToBoolean(dtRow["LaKhachVip"]);
			donHang.NgayYeuCauGuiHang = ((dtRow["NgayYeuCauGuiHang"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayYeuCauGuiHang"]));
			donHang.YeuCauGui_GhiChu = ((dtRow["YeuCauGui_GhiChu"] == DBNull.Value) ? "" : dtRow["YeuCauGui_GhiChu"].ToString());
			donHang.GuiHang_SoKg = ((dtRow["GuiHang_SoKg"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["GuiHang_SoKg"])));
			donHang.GuiHang_Tien = ((dtRow["GuiHang_Tien"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["GuiHang_Tien"])));
			donHang.LoaiHangID = ((dtRow["LoaiHangID"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["LoaiHangID"])));
			donHang.TenLoaiHang = ((dtRow["TenLoaiHang"] == DBNull.Value) ? "" : dtRow["TenLoaiHang"].ToString());
			donHang.CanHang_SoKg = ((dtRow["CanHang_SoKg"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["CanHang_SoKg"])));
			donHang.CanHang_TienShipVeVN = ((dtRow["CanHang_TienShipVeVN"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["CanHang_TienShipVeVN"])));
			donHang.CanHang_TienShipTrongNuoc = ((dtRow["CanHang_TienShipTrongNuoc"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["CanHang_TienShipTrongNuoc"])));
			donHang.HangKhoan = dtRow["HangKhoan"] != DBNull.Value && Convert.ToBoolean(dtRow["HangKhoan"]);
			donHang.MaSoHang = ((dtRow["MaSoHang"] == DBNull.Value) ? "" : dtRow["MaSoHang"].ToString());
			donHang.QuocGiaID = ((dtRow["QuocGiaID"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["QuocGiaID"])));
			donHang.TenQuocGia = ((dtRow["TenQuocGia"] == DBNull.Value) ? "" : dtRow["TenQuocGia"].ToString());
			donHang.LinkTaiKhoanMang = ((dtRow["LinkTaiKhoanMang"] == DBNull.Value) ? "" : dtRow["LinkTaiKhoanMang"].ToString());
			donHang.VungMien = ((dtRow["VungMien"] == DBNull.Value) ? "" : dtRow["VungMien"].ToString());
			return donHang;
		}
		catch
		{
			return null;
		}
	}

	protected List<DonHang> RtnDonHang(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<DonHang> list = new List<DonHang>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowDonHang(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public DonHangPhanTrang LayDanhSachDonHang(string WebsiteName, string username, string trangthaiOrder, string NoiDungTim, int TimTheo, string MaDatHang, string TenDotHang, int HangKhoan, int QuocGiaID, bool DaXoa, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachDonHang(WebsiteName, username, trangthaiOrder, NoiDungTim, TimTheo, MaDatHang, TenDotHang, HangKhoan, QuocGiaID, DaXoa, TuNgay, DenNgay, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new DonHangPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachDonHang = RtnDonHang(dataSet)
				};
			}
			return new DonHangPhanTrang();
		}
		catch (Exception)
		{
			return null;
		}
	}

	public DonHang LayDonHangByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayDonHangByID(ID);
			if (dataSet != null && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowDonHang(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected CongNo RtnRowCongNo(DataRow dtRow)
	{
		try
		{
			CongNo congNo = new CongNo();
			bool flag = dtRow["Status"] != DBNull.Value && Convert.ToBoolean(dtRow["Status"]);
			int loaiPhatSinh = ((dtRow["style"] == DBNull.Value) ? 2 : Convert.ToInt32(dtRow["style"]));
			congNo.CongNo_ID = Convert.ToInt32(dtRow["CongNo_ID"]);
			congNo.NoiDung = ((dtRow["NoiDung"] == DBNull.Value) ? "" : dtRow["NoiDung"].ToString());
			congNo.NgayGhiNo = ((dtRow["NgayGhiNo"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayGhiNo"]));
			congNo.DR = ((dtRow["DR"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["DR"])));
			congNo.CR = ((dtRow["CR"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["CR"])));
			congNo.UserName = ((dtRow["UserName"] == DBNull.Value) ? "" : dtRow["UserName"].ToString());
			congNo.Ghichu = ((dtRow["Ghichu"] == DBNull.Value) ? "" : dtRow["Ghichu"].ToString());
			congNo.Status = flag;
			congNo.StatusText = ((!flag) ? "Pending" : "Approved");
			congNo.LoHangID = ((dtRow["LoHangID"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["LoHangID"])));
			congNo.TenLoHang = ((dtRow["TenLoHang"] == DBNull.Value) ? "" : dtRow["TenLoHang"].ToString());
			congNo.NguoiTao = ((dtRow["NguoiTao"] == DBNull.Value) ? "" : dtRow["NguoiTao"].ToString());
			congNo.NguoiCapNhatCuoi = ((dtRow["NguoiCapNhatCuoi"] == DBNull.Value) ? "" : dtRow["NguoiCapNhatCuoi"].ToString());
			congNo.NgayCapNhatCuoi = ((dtRow["NgayCapNhatCuoi"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayCapNhatCuoi"]));
			congNo.LoaiPhatSinh = loaiPhatSinh;
			congNo.LoaiPhatSinhText = LayLoaiPhatSinhText(loaiPhatSinh);
			return congNo;
		}
		catch
		{
			return null;
		}
	}

	protected string LayLoaiPhatSinhText(int LoaiPhatSinh)
	{
		return LoaiPhatSinh switch
		{
			1 => "Phí mua hàng", 
			2 => "Phát sinh khác", 
			3 => "Phí ship từ nước ngoài về", 
			4 => "Phí ship trong nước", 
			5 => "Đặt cọc", 
			6 => "Phí ship về VN lô hàng", 
			7 => "Thuế hải quan lô hàng", 
			8 => "Cân Kg", 
			_ => "", 
		};
	}

	protected List<CongNo> RtnCongNo(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<CongNo> list = new List<CongNo>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowCongNo(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public CongNoPhanTrang LayDanhSachCongNo(string username, int Status, int style, string NoiDungTim, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachCongNo(username, Status, style, NoiDungTim, TuNgay, DenNgay, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				return new CongNoPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachCongNo = RtnCongNo(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public CongNoPhanTrang LayDanhSachCongNo1(string username, int Status, string LoaiPhatSinh, string NoiDungTim, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachCongNo1(username, Status, LoaiPhatSinh, NoiDungTim, TuNgay, DenNgay, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				return new CongNoPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachCongNo = RtnCongNo(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected WebLogo RtnRowWebLogo(DataRow dtRow)
	{
		try
		{
			WebLogo webLogo = new WebLogo();
			webLogo.ID = Convert.ToInt32(dtRow["ID"]);
			webLogo.TenHinh = dtRow["TenHinh"].ToString();
			webLogo.NoiDung = ((dtRow["NoiDung"] == DBNull.Value) ? "" : dtRow["NoiDung"].ToString());
			webLogo.LinkWeb = ((dtRow["LinkWeb"] == DBNull.Value) ? "" : dtRow["LinkWeb"].ToString());
			webLogo.ThuTu = ((dtRow["ThuTu"] == DBNull.Value) ? 1000 : Convert.ToInt32(dtRow["ThuTu"]));
			return webLogo;
		}
		catch
		{
			return null;
		}
	}

	protected List<WebLogo> RtnWebLogo(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<WebLogo> list = new List<WebLogo>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowWebLogo(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<WebLogo> LayDanhSachWebLogo()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachWebLogo();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnWebLogo(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			throw;
		}
	}

	public WebLogo LayWebLogoByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayWebLogoByID(ID);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowWebLogo(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected Shipper RtnRowShipper(DataRow dtRow)
	{
		try
		{
			Shipper shipper = new Shipper();
			shipper.ID = Convert.ToInt32(dtRow["ID"]);
			shipper.ShipperName = dtRow["ShipperName"].ToString();
			shipper.ShipperPhone = ((dtRow["ShipperPhone"] == DBNull.Value) ? "" : dtRow["ShipperPhone"].ToString());
			shipper.ShipperAddress = ((dtRow["ShipperAddress"] == DBNull.Value) ? "" : dtRow["ShipperAddress"].ToString());
			return shipper;
		}
		catch
		{
			return null;
		}
	}

	protected List<Shipper> RtnShipper(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<Shipper> list = new List<Shipper>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowShipper(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<Shipper> LayDanhSachShipper()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachShipper();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnShipper(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public Shipper LayShipperByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayShipperByID(ID);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowShipper(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected DotHang RtnRowDotHang(DataRow dtRow)
	{
		try
		{
			DotHang dotHang = new DotHang();
			dotHang.SoLuongHang = Convert.ToInt32(dtRow["SoLuongHang"]);
			dotHang.username = ((dtRow["username"] == DBNull.Value) ? "" : dtRow["username"].ToString());
			dotHang.TenDotHang = ((dtRow["TenDotHang"] == DBNull.Value) ? "" : dtRow["TenDotHang"].ToString());
			dotHang.SoVanDon = ((dtRow["SoVanDon"] == DBNull.Value) ? "" : dtRow["SoVanDon"].ToString());
			dotHang.ShipperID = Convert.ToInt32(dtRow["ShipperID"]);
			dotHang.ShipperName = ((dtRow["ShipperName"] == DBNull.Value) ? "" : dtRow["ShipperName"].ToString());
			dotHang.PhiShipTrongNuoc = ((dtRow["PhiShipTrongNuoc"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["PhiShipTrongNuoc"].ToString()));
			return dotHang;
		}
		catch
		{
			return null;
		}
	}

	protected List<DotHang> RtnDotHang(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<DotHang> list = new List<DotHang>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowDotHang(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public DonHangPhanTrang LayDanhSachHangShip(string username, int YeuCauGuiHang, string NoiDungTim, int TimTheo, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachHangShip(username, YeuCauGuiHang, NoiDungTim, TimTheo, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new DonHangPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachDonHang = RtnDonHang(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public DotHangPhanTrang LayDotHangGui(string UserName, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDotHangGui(UserName, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new DotHangPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachDotHang = RtnDotHang(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected ListOrder RtnRowListOrder(DataRow dtRow)
	{
		try
		{
			ListOrder listOrder = new ListOrder();
			listOrder.ID = Convert.ToInt32(dtRow["ID"]);
			listOrder.OrderNumber = ((dtRow["OrderNumber"] == DBNull.Value) ? "" : dtRow["OrderNumber"].ToString());
			listOrder.TongSoLink = ((dtRow["TongSoLink"] != DBNull.Value) ? Convert.ToInt32(dtRow["TongSoLink"]) : 0);
			listOrder.TongTienOrder = ((dtRow["TongTienOrder"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["TongTienOrder"]));
			listOrder.Card_ID = ((dtRow["Card_ID"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["Card_ID"])));
			listOrder.tracking_number = ((dtRow["tracking_number"] == DBNull.Value) ? "" : dtRow["tracking_number"].ToString());
			listOrder.NgayNhanTaiNuocNgoai = ((dtRow["NgayNhanTaiNuocNgoai"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?(Convert.ToDateTime(dtRow["NgayNhanTaiNuocNgoai"])));
			listOrder.TrackingLink = ((dtRow["TrackingLink"] == DBNull.Value) ? "" : dtRow["TrackingLink"].ToString());
			return listOrder;
		}
		catch
		{
			return null;
		}
	}

	protected List<ListOrder> RtnListOrder(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<ListOrder> list = new List<ListOrder>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowListOrder(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public ListOrderPhanTrang LayDanhSachListOrder(string OrderNumber, string TrackingNumber, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachListOrder(OrderNumber, TrackingNumber, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new ListOrderPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachListOrder = RtnListOrder(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected HanMucKhachHang RtnRowHanMucKhachHang(DataRow dtRow)
	{
		try
		{
			HanMucKhachHang hanMucKhachHang = new HanMucKhachHang();
			hanMucKhachHang.ID = Convert.ToInt32(dtRow["ID"]);
			hanMucKhachHang.UserName = ((dtRow["UserName"] == DBNull.Value) ? "" : dtRow["UserName"].ToString());
			hanMucKhachHang.DaQuaHanMuc = dtRow["DaQuaHanMuc"] != DBNull.Value && Convert.ToBoolean(dtRow["DaQuaHanMuc"]);
			hanMucKhachHang.LaKhachVip = dtRow["LaKhachVip"] != DBNull.Value && Convert.ToBoolean(dtRow["LaKhachVip"]);
			return hanMucKhachHang;
		}
		catch
		{
			return null;
		}
	}

	protected List<HanMucKhachHang> RtnHanMucKhachHang(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<HanMucKhachHang> list = new List<HanMucKhachHang>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowHanMucKhachHang(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public HanMucKhachHangPhanTrang LayDanhSachHanMucKhachHang(string UserName, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachHanMucKhachHang(UserName, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				return new HanMucKhachHangPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachHanMucKhachHang = RtnHanMucKhachHang(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected HangCoSan RtnRowHangCoSan(DataRow dtRow)
	{
		try
		{
			HangCoSan hangCoSan = new HangCoSan();
			hangCoSan.ID = Convert.ToInt32(dtRow["ID"]);
			hangCoSan.TenHinh = dtRow["TenHinh"].ToString();
			hangCoSan.MaSoHang = dtRow["MaSoHang"].ToString();
			hangCoSan.TenHang = ((dtRow["TenHang"] == DBNull.Value) ? "" : dtRow["TenHang"].ToString());
			hangCoSan.LinkHang = ((dtRow["LinkHang"] == DBNull.Value) ? "" : dtRow["LinkHang"].ToString());
			hangCoSan.GiaTien = ((dtRow["GiaTien"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["GiaTien"])));
			hangCoSan.MoTa = ((dtRow["MoTa"] == DBNull.Value) ? "" : dtRow["MoTa"].ToString());
			hangCoSan.SoSao = ((dtRow["SoSao"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["SoSao"])));
			hangCoSan.ThuTu = ((dtRow["ThuTu"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["ThuTu"])));
			return hangCoSan;
		}
		catch
		{
			return null;
		}
	}

	protected List<HangCoSan> RtnHangCoSan(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<HangCoSan> list = new List<HangCoSan>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowHangCoSan(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	protected List<HangCoSan> RtnHangCoSanPhanTrang(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<HangCoSan> list = new List<HangCoSan>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowHangCoSan(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<HangCoSan> LayDanhSachHangCoSan()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachHangCoSan();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnHangCoSan(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			throw;
		}
	}

	public HangCoSanPhanTrang LayDanhSachHangCoSanPhanTrang(string NoiDungTim, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachHangCoSanPhanTrang(NoiDungTim, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new HangCoSanPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachHangCoSan = RtnHangCoSanPhanTrang(dataSet)
				};
			}
			return new HangCoSanPhanTrang();
		}
		catch (Exception)
		{
			return null;
		}
	}

	public HangCoSan LayHangCoSanByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayHangCoSanByID(ID);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowHangCoSan(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected GiaTienCong RtnRowGiaTienCong(DataRow dtRow)
	{
		try
		{
			GiaTienCong giaTienCong = new GiaTienCong();
			giaTienCong.ID = Convert.ToInt32(dtRow["ID"]);
			giaTienCong.LoaiTien = ((dtRow["LoaiTien"] == DBNull.Value) ? "" : dtRow["LoaiTien"].ToString());
			giaTienCong.TuGia = Convert.ToDouble(dtRow["TuGia"]);
			giaTienCong.DenGia = Convert.ToDouble(dtRow["DenGia"]);
			giaTienCong.TienCong1Mon = Convert.ToDouble(dtRow["TienCong1Mon"]);
			giaTienCong.TinhTheoPhanTram = Convert.ToBoolean(dtRow["TinhTheoPhanTram"]);
			giaTienCong.KhachBuon = Convert.ToBoolean(dtRow["KhachBuon"]);
			return giaTienCong;
		}
		catch
		{
			return null;
		}
	}

	public GiaTienCong LayGiaTienCong(string LoaiTien, double SoTien1Mon, bool KhachBuon)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayGiaTienCong(LoaiTien, SoTien1Mon, KhachBuon);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowGiaTienCong(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected List<GiaTienCong> RtnGiaTienCong(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<GiaTienCong> list = new List<GiaTienCong>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowGiaTienCong(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<GiaTienCong> LayDanhSachGiaTienCong()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachGiaTienCong();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnGiaTienCong(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public GiaTienCong LayGiaTienCongByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayGiaTienCongByID(ID);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowGiaTienCong(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected List<LoaiHang> RtnLoaiHang(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<LoaiHang> list = new List<LoaiHang>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				DataRow dataRow = ds.Tables[0].Rows[i];
				LoaiHang loaiHang = new LoaiHang();
				loaiHang.LoaiHangID = Convert.ToInt32(dataRow["LoaiHangID"]);
				loaiHang.TenLoaiHang = dataRow["TenLoaiHang"].ToString();
				list.Add(loaiHang);
			}
			return list;
		}
		return null;
	}

	public List<LoaiHang> LayDanhSachLoaiHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachLoaiHang();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnLoaiHang(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected CongShipVeVN RtnRowCongShipVeVN(DataRow dtRow)
	{
		try
		{
			CongShipVeVN congShipVeVN = new CongShipVeVN();
			congShipVeVN.ID = Convert.ToInt32(dtRow["ID"]);
			congShipVeVN.LoaiHangID = Convert.ToInt32(dtRow["LoaiHangID"]);
			congShipVeVN.TenLoaiHang = ((dtRow["TenLoaiHang"] == DBNull.Value) ? "" : dtRow["TenLoaiHang"].ToString());
			congShipVeVN.LoaiTien = ((dtRow["LoaiTien"] == DBNull.Value) ? "" : dtRow["LoaiTien"].ToString());
			congShipVeVN.TienCongShipVeVN = Convert.ToDouble(dtRow["TienCongShipVeVN"]);
			congShipVeVN.KhachBuon = Convert.ToBoolean(dtRow["KhachBuon"]);
			return congShipVeVN;
		}
		catch
		{
			return null;
		}
	}

	protected List<CongShipVeVN> RtnCongShipVeVN(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<CongShipVeVN> list = new List<CongShipVeVN>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowCongShipVeVN(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<CongShipVeVN> LayDanhSachCongShipVeVN()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachCongShipVeVN();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnCongShipVeVN(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public CongShipVeVN LayCongShipVeVNByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayCongShipVeVNByID(ID);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowCongShipVeVN(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected DiaChiNhanHang RtnRowDiaChiNhanHang(DataRow dtRow)
	{
		try
		{
			DiaChiNhanHang diaChiNhanHang = new DiaChiNhanHang();
			diaChiNhanHang.ID = Convert.ToInt32(dtRow["ID"]);
			diaChiNhanHang.UserName = ((dtRow["UserName"] == DBNull.Value) ? "" : dtRow["UserName"].ToString());
			diaChiNhanHang.DiaChi = ((dtRow["DiaChi"] == DBNull.Value) ? "" : dtRow["DiaChi"].ToString());
			return diaChiNhanHang;
		}
		catch
		{
			return null;
		}
	}

	protected List<DiaChiNhanHang> RtnDiaChiNhanHang(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<DiaChiNhanHang> list = new List<DiaChiNhanHang>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowDiaChiNhanHang(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public DiaChiNhanHangPhanTrang LayDanhSachDiaChiNhanHang(string UserName, string NoiDungTim, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachDiaChiNhanHang(UserName, NoiDungTim, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				return new DiaChiNhanHangPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachDiaChiNhanHang = RtnDiaChiNhanHang(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected LoHang RtnRowLoHang(DataRow dtRow)
	{
		try
		{
			LoHang loHang = new LoHang();
			loHang.LoHangID = Convert.ToInt32(dtRow["LoHangID"]);
			loHang.UserName = ((dtRow["UserName"] == DBNull.Value) ? "" : dtRow["UserName"].ToString());
			loHang.NgayLoHang = (DateTime)dtRow["NgayLoHang"];
			loHang.TenLoHang = ((dtRow["TenLoHang"] == DBNull.Value) ? "" : dtRow["TenLoHang"].ToString());
			loHang.LoaiTien = ((dtRow["LoaiTien"] == DBNull.Value) ? "" : dtRow["LoaiTien"].ToString());
			loHang.TyGia = ((dtRow["TyGia"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["TyGia"])));
			loHang.NgayDenDuKien = ((dtRow["NgayDenDuKien"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayDenDuKien"]));
			loHang.NgayDenThucTe = ((dtRow["NgayDenThucTe"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayDenThucTe"]));
			loHang.NguoiTao = ((dtRow["NguoiTao"] == DBNull.Value) ? "" : dtRow["NguoiTao"].ToString());
			loHang.NgayTao = (DateTime)dtRow["NgayTao"];
			loHang.TienLoHangA = ((dtRow["TienLoHangA"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["TienLoHangA"])));
			loHang.TienPhiHaiQuanB = ((dtRow["TienPhiHaiQuanB"] == DBNull.Value) ? ((double?)null) : new double?(Convert.ToDouble(dtRow["TienPhiHaiQuanB"])));
			loHang.TongTienLoHang = ((dtRow["TienLoHangA"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["TienLoHangA"])) + ((dtRow["TienPhiHaiQuanB"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["TienPhiHaiQuanB"]));
			return loHang;
		}
		catch
		{
			return null;
		}
	}

	protected List<LoHang> RtnLoHang(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<LoHang> list = new List<LoHang>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowLoHang(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public LoHangPhanTrang LayDanhSachLoHang(string UserName, DateTime? TuNgay, DateTime? DenNgay, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachLoHang(UserName, TuNgay, DenNgay, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new LoHangPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachLoHang = RtnLoHang(dataSet)
				};
			}
			return new LoHangPhanTrang();
		}
		catch (Exception)
		{
			return null;
		}
	}

	public LoHang LayLoHangByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayLoHangByID(ID);
			if (dataSet != null && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowLoHang(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected Tracking RtnRowTracking(DataRow dtRow)
	{
		try
		{
			Tracking tracking = new Tracking();
			tracking.TrackingID = Convert.ToInt32(dtRow["TrackingID"]);
			tracking.UserName = ((dtRow["UserName"] == DBNull.Value) ? "" : dtRow["UserName"].ToString());
			tracking.TrackingNumber = ((dtRow["TrackingNumber"] == DBNull.Value) ? "" : dtRow["TrackingNumber"].ToString());
			tracking.OrderNumber = ((dtRow["OrderNumber"] == DBNull.Value) ? "" : dtRow["OrderNumber"].ToString());
			tracking.NgayDatHang = ((dtRow["NgayDatHang"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayDatHang"]));
			tracking.NhaVanChuyenID = ((dtRow["NhaVanChuyenID"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["NhaVanChuyenID"])));
			tracking.TenNhaVanChuyen = ((dtRow["TenNhaVanChuyen"] == DBNull.Value) ? "" : dtRow["TenNhaVanChuyen"].ToString());
			tracking.QuocGiaID = ((dtRow["QuocGiaID"] == DBNull.Value) ? ((int?)null) : new int?(Convert.ToInt32(dtRow["QuocGiaID"])));
			tracking.TenQuocGia = ((dtRow["TenQuocGia"] == DBNull.Value) ? "" : dtRow["TenQuocGia"].ToString());
			tracking.NgayLoHang = ((dtRow["NgayLoHang"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayLoHang"]));
			tracking.TenLoHang = ((dtRow["TenLoHang"] == DBNull.Value) ? "" : dtRow["TenLoHang"].ToString());
			tracking.TinhTrang = ((dtRow["TinhTrang"] == DBNull.Value) ? "" : dtRow["TinhTrang"].ToString());
			tracking.GhiChu = ((dtRow["GhiChu"] == DBNull.Value) ? "" : dtRow["GhiChu"].ToString());
			tracking.NguoiTao = ((dtRow["NguoiTao"] == DBNull.Value) ? "" : dtRow["NguoiTao"].ToString());
			tracking.NgayTao = (DateTime)dtRow["NgayTao"];
			tracking.Kien = ((dtRow["Kien"] == DBNull.Value) ? "" : dtRow["Kien"].ToString());
			tracking.Mawb = ((dtRow["Mawb"] == DBNull.Value) ? "" : dtRow["Mawb"].ToString());
			tracking.Hawb = ((dtRow["Hawb"] == DBNull.Value) ? "" : dtRow["Hawb"].ToString());
			tracking.LinkTaiKhoanMang = ((dtRow["LinkTaiKhoanMang"] == DBNull.Value) ? "" : dtRow["LinkTaiKhoanMang"].ToString());
			return tracking;
		}
		catch
		{
			return null;
		}
	}

	protected List<Tracking> RtnTracking(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<Tracking> list = new List<Tracking>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowTracking(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public TrackingPhanTrang LayDanhSachTracking(string UserName, string TinhTrang, string NoiDungTim, int TimTheo, string TrackingNumber, string TenLoHang, int QuocGiaID, bool DaXoa, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachTracking(UserName, TinhTrang, NoiDungTim, TimTheo, TrackingNumber, TenLoHang, QuocGiaID, DaXoa, TuNgay, DenNgay, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new TrackingPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachTracking = RtnTracking(dataSet)
				};
			}
			return new TrackingPhanTrang();
		}
		catch (Exception)
		{
			return null;
		}
	}

	public Tracking LayTrackingByID(int ID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayTrackingByID(ID);
			if (dataSet != null && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowTracking(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected LuocSuTracking RtnRowLuocSuTracking(DataRow dtRow)
	{
		try
		{
			LuocSuTracking luocSuTracking = new LuocSuTracking();
			luocSuTracking.TinhTrangTrackingID = Convert.ToInt32(dtRow["TinhTrangTrackingID"]);
			luocSuTracking.TrackingID = Convert.ToInt32(dtRow["TrackingID"]);
			luocSuTracking.TinhTrang = ((dtRow["TinhTrang"] == DBNull.Value) ? "" : dtRow["TinhTrang"].ToString());
			luocSuTracking.MoTaTinhTrang = ((dtRow["MoTaTinhTrang"] == DBNull.Value) ? "" : dtRow["MoTaTinhTrang"].ToString());
			luocSuTracking.NgayChuyenTinhTrang = ((dtRow["NgayChuyenTinhTrang"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayChuyenTinhTrang"]));
			luocSuTracking.GhiChu = ((dtRow["GhiChu"] == DBNull.Value) ? "" : dtRow["GhiChu"].ToString());
			luocSuTracking.NguoiTao = ((dtRow["NguoiTao"] == DBNull.Value) ? "" : dtRow["NguoiTao"].ToString());
			luocSuTracking.NgayTao = (DateTime)dtRow["NgayTao"];
			return luocSuTracking;
		}
		catch
		{
			return null;
		}
	}

	protected List<LuocSuTracking> RtnLuocSuTracking(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<LuocSuTracking> list = new List<LuocSuTracking>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowLuocSuTracking(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<LuocSuTracking> LayDanhSachLuocSuTrackingByNumber(string TrackingNumber)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachTinhTrangTrackingByNumber(TrackingNumber);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnLuocSuTracking(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected SystemLogs RtnRowSystemLogs(DataRow r)
	{
		try
		{
			return new SystemLogs
			{
				SystemLogsID = r["SystemLogsID"].ToString(),
				NgayTao = (DateTime)r["NgayTao"],
				NguoiTao = ((r["NguoiTao"] == DBNull.Value) ? "" : r["NguoiTao"].ToString()),
				Nguon = ((r["Nguon"] == DBNull.Value) ? "" : r["Nguon"].ToString()),
				HanhDong = ((r["HanhDong"] == DBNull.Value) ? "" : r["HanhDong"].ToString()),
				DoiTuong = ((r["DoiTuong"] == DBNull.Value) ? "" : r["DoiTuong"].ToString()),
				NoiDung = ((r["NoiDung"] == DBNull.Value) ? "" : r["NoiDung"].ToString())
			};
		}
		catch
		{
			return null;
		}
	}

	protected List<SystemLogs> RtnSystemLogs(DataSet dsSystemLogs)
	{
		try
		{
			List<SystemLogs> list = new List<SystemLogs>();
			if (dsSystemLogs != null && dsSystemLogs.Tables.Count > 1 && dsSystemLogs.Tables[1].Rows.Count > 0)
			{
				for (int i = 0; i < dsSystemLogs.Tables[1].Rows.Count; i++)
				{
					DataRow r = dsSystemLogs.Tables[1].Rows[i];
					list.Add(RtnRowSystemLogs(r));
				}
			}
			return list;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemSystemLogs(SystemLogs sl)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			return dBConnect.ThemSystemLogs(sl.NguoiTao, sl.Nguon, sl.HanhDong, sl.DoiTuong, sl.NoiDung);
		}
		catch (Exception)
		{
			return false;
		}
	}

	public KetQuaTimKiemSystemLogs TimKiemSystemLogs(string NguoiTao, string Nguon, string HanhDong, string DoiTuong, string NoiDung, DateTime? TuNgay, DateTime? DenNgay, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.TimKiemSystemLogs(NguoiTao, Nguon, HanhDong, DoiTuong, NoiDung, TuNgay, DenNgay, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new KetQuaTimKiemSystemLogs
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachSystemLogs = RtnSystemLogs(dataSet)
				};
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public List<SystemLogs> LaySystemLogsLienQuan(string DoiTuong)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LaySystemLogsLienQuan(DoiTuong);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				List<SystemLogs> list = new List<SystemLogs>();
				if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
				{
					for (int i = 0; i < dataSet.Tables[0].Rows.Count; i++)
					{
						DataRow r = dataSet.Tables[0].Rows[i];
						list.Add(RtnRowSystemLogs(r));
					}
				}
				return list;
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public string NoiDungDonHangSystemLogs(string username, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, double saleoff, double phuthu, double shipUSA, double tax, double cong, string loaitien, string ghichu, double tygia, double giasauoffUSD, double giasauoffVND, double tiencongUSD, double tiencongVND, double tongtienUSD, double tongtienVND, string ordernumber, string trangthaiOrder, string ngaysaveLink, string ngaymuahang, string MaSoHang)
	{
		try
		{
			string text = "";
			text = text + "linkweb: " + linkweb + ";" + Environment.NewLine;
			text = text + "linkhinh: " + linkhinh + ";" + Environment.NewLine;
			text = text + "corlor: " + corlor + ";";
			text = text + "size: " + size + ";";
			text = text + "soluong: " + soluong + ";";
			text = text + "dongiaweb: " + dongiaweb + ";";
			text = text + "saleoff: " + saleoff + ";";
			text = text + "phuthu: " + phuthu + ";";
			text = text + "shipUSA: " + shipUSA + ";";
			text = text + "tax: " + tax + ";";
			text = text + "cong: " + cong + ";";
			text = text + "loaitien: " + loaitien + ";";
			text = text + "tygia: " + tygia + ";" + Environment.NewLine;
			text = text + "ghichu: " + ghichu + ";" + Environment.NewLine;
			text = text + "giasauoffUSD: " + giasauoffUSD + ";";
			text = text + "giasauoffVND: " + giasauoffVND + ";";
			text = text + "tiencongUSD: " + tiencongUSD + ";";
			text = text + "tiencongVND: " + tiencongVND + ";";
			text = text + "tongtienUSD: " + tongtienUSD + ";";
			text = text + "tongtienVND: " + tongtienVND + ";" + Environment.NewLine;
			text = text + "MaSoHang: " + MaSoHang + ";";
			text = text + "Username: " + username + ";";
			text = text + "ordernumber: " + ordernumber + ";";
			text = text + "trangthaiOrder: " + trangthaiOrder + ";";
			text = text + "ngaysaveLink: " + ngaysaveLink + ";";
			return text + "ngaymuahang: " + ngaymuahang + ";" + Environment.NewLine;
		}
		catch (Exception)
		{
			return "";
		}
	}

	public string NoiDungTrackingSystemLogs(string UserName, string TrackingNumber, string OrderNumber, DateTime? NgayDatHang, int? NhaVanChuyenID, int? QuocGiaID, string TinhTrang, string GhiChu, string NguoiTao, string Kien, string Mawb, string Hawb)
	{
		try
		{
			string text = "";
			text = text + "UserName: " + UserName + ";";
			text = text + "TrackingNumber: " + TrackingNumber + ";";
			text = text + "OrderNumber: " + OrderNumber + ";";
			text = text + "NgayDatHang: " + (NgayDatHang.HasValue ? NgayDatHang.Value.ToString("dd/MM/yyyy") : "") + ";";
			text = text + "NhaVanChuyenID: " + (NhaVanChuyenID.HasValue ? NhaVanChuyenID.Value.ToString() : "") + ";";
			text = text + "QuocGiaID: " + (QuocGiaID.HasValue ? QuocGiaID.Value.ToString() : "") + ";";
			text = text + "TinhTrang: " + TinhTrang + ";";
			text = text + "GhiChu: " + GhiChu + ";";
			text = text + "NguoiTao: " + NguoiTao + ";";
			text = text + "Kien: " + Kien + ";";
			text = text + "Mawb: " + Mawb + ";";
			return text + "Hawb: " + Hawb + ";";
		}
		catch (Exception)
		{
			return "";
		}
	}

	public string NoiDungCongNoSystemLogs(string UserName, string NoiDung, string NgayGhiNo, double? DR, double? CR, string GhiChu, bool status)
	{
		try
		{
			string text = "";
			text = text + "UserName: " + UserName + ";";
			text = text + "NgayGhiNo: " + NgayGhiNo + ";";
			text = text + "DR: " + (DR.HasValue ? DR.Value.ToString() : "") + ";";
			text = text + "CR: " + (CR.HasValue ? CR.Value.ToString() : "") + ";" + Environment.NewLine;
			text = text + "NoiDung: " + NoiDung + ";";
			text = text + "GhiChu: " + GhiChu + ";";
			return text + "status: " + status + ";";
		}
		catch (Exception)
		{
			return "";
		}
	}

	public string NoiDungUserSystemLogs(string UserName, string HoTen, string DiaChi, string TinhThanh, string PhoneNumber, string Email, string SoTaiKhoan, string HinhThucNhanHang, bool KhachBuon, string LinkTaiKhoanMang, string VungMien)
	{
		try
		{
			string text = "";
			text = text + "UserName: " + UserName + ";";
			text = text + "HoTen: " + HoTen + ";";
			text = text + "DiaChi: " + DiaChi + ";";
			text = text + "TinhThanh: " + TinhThanh + ";";
			text = text + "PhoneNumber: " + PhoneNumber + ";";
			text = text + "Email: " + Email + ";";
			text = text + "SoTaiKhoan: " + SoTaiKhoan + ";";
			text = text + "HinhThucNhanHang: " + HinhThucNhanHang + ";";
			text = text + "KhachBuon: " + KhachBuon + ";";
			return text + "LinkTaiKhoanMang: " + LinkTaiKhoanMang + ";";
		}
		catch (Exception)
		{
			return "";
		}
	}

	protected Ky RtnRowKy(DataRow dtRow)
	{
		try
		{
			Ky ky = new Ky();
			ky.KyID = ((dtRow["KyID"] != DBNull.Value) ? Convert.ToInt32(dtRow["KyID"]) : 0);
			ky.Thang = ((dtRow["Thang"] != DBNull.Value) ? Convert.ToInt32(dtRow["Thang"]) : 0);
			ky.Nam = ((dtRow["Nam"] != DBNull.Value) ? Convert.ToInt32(dtRow["Nam"]) : 0);
			ky.TenKy = ((dtRow["TenKy"] != DBNull.Value) ? Convert.ToInt32(dtRow["TenKy"]) : 0);
			ky.DaDong = dtRow["DaDong"] != DBNull.Value && Convert.ToBoolean(dtRow["DaDong"]);
			return ky;
		}
		catch
		{
			return null;
		}
	}

	protected List<Ky> RtnKy(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
		{
			List<Ky> list = new List<Ky>();
			for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
			{
				list.Add(RtnRowKy(ds.Tables[0].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public List<Ky> LayDanhSachKy()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachKy();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return RtnKy(dataSet);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public Ky LayKyByID(int KyID)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayKyByID(KyID);
			if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
			{
				return RtnRowKy(dataSet.Tables[0].Rows[0]);
			}
			return null;
		}
		catch (Exception)
		{
			return null;
		}
	}

	protected ChotKy RtnRowChotKy(DataRow dtRow)
	{
		try
		{
			ChotKy chotKy = new ChotKy();
			chotKy.ChotKyID = Convert.ToInt32(dtRow["ChotKyID"]);
			chotKy.UserName = dtRow["UserName"].ToString();
			chotKy.DauKy = ((dtRow["DauKy"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["DauKy"]));
			chotKy.PhatSinhThuDR = ((dtRow["PhatSinhThuDR"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["PhatSinhThuDR"]));
			chotKy.PhatSinhChiCR = ((dtRow["PhatSinhChiCR"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["PhatSinhChiCR"]));
			chotKy.PhatSinhCanDoi = ((dtRow["PhatSinhCanDoi"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["PhatSinhCanDoi"]));
			chotKy.CuoiKy = ((dtRow["CuoiKy"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dtRow["CuoiKy"]));
			chotKy.TamMoKy = dtRow["TamMoKy"] != DBNull.Value && Convert.ToBoolean(dtRow["TamMoKy"]);
			chotKy.KyID = Convert.ToInt32(dtRow["KyID"]);
			chotKy.TenKy = Convert.ToInt32(dtRow["TenKy"]);
			chotKy.Nam = Convert.ToInt32(dtRow["Nam"]);
			chotKy.Thang = Convert.ToInt32(dtRow["Thang"]);
			chotKy.DaDong = dtRow["DaDong"] != DBNull.Value && Convert.ToBoolean(dtRow["DaDong"]);
			chotKy.NguoiTao = ((dtRow["NguoiTao"] == DBNull.Value) ? "" : dtRow["NguoiTao"].ToString());
			chotKy.NgayTao = ((dtRow["NgayTao"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayTao"]));
			chotKy.NguoiCapNhatCuoi = ((dtRow["NguoiCapNhatCuoi"] == DBNull.Value) ? "" : dtRow["NguoiCapNhatCuoi"].ToString());
			chotKy.NgayCapNhatCuoi = ((dtRow["NgayCapNhatCuoi"] == DBNull.Value) ? ((DateTime?)null) : new DateTime?((DateTime)dtRow["NgayCapNhatCuoi"]));
			return chotKy;
		}
		catch
		{
			return null;
		}
	}

	protected List<ChotKy> RtnChotKy(DataSet ds)
	{
		if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
		{
			List<ChotKy> list = new List<ChotKy>();
			for (int i = 0; i < ds.Tables[1].Rows.Count; i++)
			{
				list.Add(RtnRowChotKy(ds.Tables[1].Rows[i]));
			}
			return list;
		}
		return null;
	}

	public ChotKyPhanTrang LayDanhSachChotKy(int KyID, string UserName, int TamMoKy, int PageSize, int PageNum)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = null;
			dataSet = dBConnect.LayDanhSachChotKy(KyID, UserName, TamMoKy, PageSize, PageNum);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				return new ChotKyPhanTrang
				{
					TotalItem = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]),
					DanhSachChotKy = RtnChotKy(dataSet)
				};
			}
			return new ChotKyPhanTrang();
		}
		catch (Exception)
		{
			return null;
		}
	}
}
