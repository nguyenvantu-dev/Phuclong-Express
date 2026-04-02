using System;
using System.Data;
using System.Data.SqlClient;

public class DBConnect : DataProvider
{
	~DBConnect()
	{
		CloseDatabase();
	}

	public DataSet LayDanhSachDonHang(string WebsiteName, string username, string trangthaiOrder, string NoiDungTim, int TimTheo, string MaDatHang, string TenDotHang, int HangKhoan, int QuocGiaID, bool DaXoa, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DonHang";
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@trangthaiOrder", trangthaiOrder);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@TimTheo", TimTheo);
			base.CDBCommand.Parameters.AddWithValue("@MaDatHang", MaDatHang);
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@HangKhoan", HangKhoan);
			base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBCommand.Parameters.AddWithValue("@DaXoa", DaXoa);
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LaySoLuongDonHang(string username, int HangKhoan)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_SoLuongDonHang";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@HangKhoan", HangKhoan);
			base.CDBCommand.Parameters.AddWithValue("@DaXoa", false);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LaySoLuongDonHangDaXoa(string username, int HangKhoan)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_SoLuongDonHang";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@HangKhoan", HangKhoan);
			base.CDBCommand.Parameters.AddWithValue("@DaXoa", true);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool InsertItem(string username, string usernamesave, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, double saleoff, double phuthu, double? shipUSA, double tax, double cong, string loaitien, string ghichu, double tygia, double giasauoffUSD, double giasauoffVND, double tiencongUSD, double tiencongVND, double tongtienUSD, double tongtienVND, string ordernumber, string trangthaiOrder, DateTime ngaysaveLink, DateTime ngaymuahang)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "DonHang_InsertItem";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@usernamesave", usernamesave);
			base.CDBCommand.Parameters.AddWithValue("@linkweb", linkweb);
			base.CDBCommand.Parameters.AddWithValue("@linkhinh", linkhinh);
			base.CDBCommand.Parameters.AddWithValue("@corlor", corlor);
			base.CDBCommand.Parameters.AddWithValue("@size", size);
			base.CDBCommand.Parameters.AddWithValue("@soluong", soluong);
			base.CDBCommand.Parameters.AddWithValue("@dongiaweb", dongiaweb);
			base.CDBCommand.Parameters.AddWithValue("@saleoff", saleoff);
			base.CDBCommand.Parameters.AddWithValue("@phuthu", phuthu);
			if (shipUSA.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", shipUSA);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@tax", tax);
			base.CDBCommand.Parameters.AddWithValue("@cong", cong);
			base.CDBCommand.Parameters.AddWithValue("@loaitien", loaitien);
			base.CDBCommand.Parameters.AddWithValue("@ghichu", ghichu);
			base.CDBCommand.Parameters.AddWithValue("@tygia", tygia);
			base.CDBCommand.Parameters.AddWithValue("@giasauoffUSD", giasauoffUSD);
			base.CDBCommand.Parameters.AddWithValue("@giasauoffVND", giasauoffVND);
			base.CDBCommand.Parameters.AddWithValue("@tiencongUSD", tiencongUSD);
			base.CDBCommand.Parameters.AddWithValue("@tiencongVND", tiencongVND);
			base.CDBCommand.Parameters.AddWithValue("@tongtienUSD", tongtienUSD);
			base.CDBCommand.Parameters.AddWithValue("@tongtienVND", tongtienVND);
			base.CDBCommand.Parameters.AddWithValue("@ordernumber", ordernumber);
			base.CDBCommand.Parameters.AddWithValue("@trangthaiOrder", trangthaiOrder);
			base.CDBCommand.Parameters.AddWithValue("@ngaysaveLink", ngaysaveLink);
			base.CDBCommand.Parameters.AddWithValue("@ngaymuahang", ngaymuahang);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatDonHang(int ID, string username, string usernamesave, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, double saleoff, double phuthu, double? shipUSA, double tax, double cong, string loaitien, string ghichu, double tygia, double giasauoffUSD, double giasauoffVND, double tiencongUSD, double tiencongVND, double tongtienUSD, double tongtienVND, string ordernumber, string trangthaiOrder, DateTime? ngaymuahang, DateTime? ngayveVN, string AdminNote, int? LoaiHangID, int? QuocGiaID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhatDonHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@usernamesave", usernamesave);
			base.CDBCommand.Parameters.AddWithValue("@linkweb", linkweb);
			base.CDBCommand.Parameters.AddWithValue("@linkhinh", linkhinh);
			base.CDBCommand.Parameters.AddWithValue("@corlor", corlor);
			base.CDBCommand.Parameters.AddWithValue("@size", size);
			base.CDBCommand.Parameters.AddWithValue("@soluong", soluong);
			base.CDBCommand.Parameters.AddWithValue("@dongiaweb", dongiaweb);
			base.CDBCommand.Parameters.AddWithValue("@saleoff", saleoff);
			base.CDBCommand.Parameters.AddWithValue("@phuthu", phuthu);
			if (shipUSA.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", shipUSA.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@tax", tax);
			base.CDBCommand.Parameters.AddWithValue("@cong", cong);
			base.CDBCommand.Parameters.AddWithValue("@loaitien", loaitien);
			base.CDBCommand.Parameters.AddWithValue("@ghichu", ghichu);
			base.CDBCommand.Parameters.AddWithValue("@tygia", tygia);
			base.CDBCommand.Parameters.AddWithValue("@giasauoffUSD", giasauoffUSD);
			base.CDBCommand.Parameters.AddWithValue("@giasauoffVND", giasauoffVND);
			base.CDBCommand.Parameters.AddWithValue("@tiencongUSD", tiencongUSD);
			base.CDBCommand.Parameters.AddWithValue("@tiencongVND", tiencongVND);
			base.CDBCommand.Parameters.AddWithValue("@tongtienUSD", tongtienUSD);
			base.CDBCommand.Parameters.AddWithValue("@tongtienVND", tongtienVND);
			base.CDBCommand.Parameters.AddWithValue("@ordernumber", ordernumber);
			base.CDBCommand.Parameters.AddWithValue("@trangthaiOrder", trangthaiOrder);
			if (ngaymuahang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@ngaymuahang", ngaymuahang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@ngaymuahang", DBNull.Value);
			}
			if (ngayveVN.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@ngayveVN", ngayveVN.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@ngayveVN", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@AdminNote", AdminNote);
			if (LoaiHangID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", LoaiHangID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", DBNull.Value);
			}
			if (QuocGiaID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatDonHangSimple(int ID, string WebsiteName, string username, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, string loaitien, string ghichu, double tygia, double saleoff, int? LoaiHangID, string MaSoHang, int? QuocGiaID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhatDonHangSimple";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@linkweb", linkweb);
			base.CDBCommand.Parameters.AddWithValue("@linkhinh", linkhinh);
			base.CDBCommand.Parameters.AddWithValue("@corlor", corlor);
			base.CDBCommand.Parameters.AddWithValue("@size", size);
			base.CDBCommand.Parameters.AddWithValue("@soluong", soluong);
			base.CDBCommand.Parameters.AddWithValue("@dongiaweb", dongiaweb);
			base.CDBCommand.Parameters.AddWithValue("@loaitien", loaitien);
			base.CDBCommand.Parameters.AddWithValue("@ghichu", ghichu);
			base.CDBCommand.Parameters.AddWithValue("@tygia", tygia);
			base.CDBCommand.Parameters.AddWithValue("@saleoff", saleoff);
			if (LoaiHangID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", LoaiHangID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@MaSoHang", MaSoHang);
			if (QuocGiaID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatDonHangSimpleCoTamTinh(int ID, string WebsiteName, string username, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, string loaitien, string ghichu, double tygia, double saleoff, double cong, double? shipUSA, double tax, double phuthu, int? QuocGiaID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhatDonHangSimpleCoTamTinh";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@linkweb", linkweb);
			base.CDBCommand.Parameters.AddWithValue("@linkhinh", linkhinh);
			base.CDBCommand.Parameters.AddWithValue("@corlor", corlor);
			base.CDBCommand.Parameters.AddWithValue("@size", size);
			base.CDBCommand.Parameters.AddWithValue("@soluong", soluong);
			base.CDBCommand.Parameters.AddWithValue("@dongiaweb", dongiaweb);
			base.CDBCommand.Parameters.AddWithValue("@loaitien", loaitien);
			base.CDBCommand.Parameters.AddWithValue("@ghichu", ghichu);
			base.CDBCommand.Parameters.AddWithValue("@tygia", tygia);
			base.CDBCommand.Parameters.AddWithValue("@saleoff", saleoff);
			base.CDBCommand.Parameters.AddWithValue("@cong", cong);
			if (shipUSA.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", shipUSA);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@tax", tax);
			base.CDBCommand.Parameters.AddWithValue("@phuthu", phuthu);
			if (QuocGiaID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemDatHangSimple(string WebsiteName, string username, string usernamesave, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, string loaitien, string ghichu, double tygia, double saleoff, bool HangKhoan, int? LoaiHangID, string MaSoHang, int? QuocGiaID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_DonHang_Simple";
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@usernamesave", usernamesave);
			base.CDBCommand.Parameters.AddWithValue("@linkweb", linkweb);
			base.CDBCommand.Parameters.AddWithValue("@linkhinh", linkhinh);
			base.CDBCommand.Parameters.AddWithValue("@corlor", corlor);
			base.CDBCommand.Parameters.AddWithValue("@size", size);
			base.CDBCommand.Parameters.AddWithValue("@soluong", soluong);
			base.CDBCommand.Parameters.AddWithValue("@dongiaweb", dongiaweb);
			base.CDBCommand.Parameters.AddWithValue("@loaitien", loaitien);
			base.CDBCommand.Parameters.AddWithValue("@ghichu", ghichu);
			base.CDBCommand.Parameters.AddWithValue("@tygia", tygia);
			base.CDBCommand.Parameters.AddWithValue("@saleoff", saleoff);
			base.CDBCommand.Parameters.AddWithValue("@HangKhoan", HangKhoan);
			if (LoaiHangID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", LoaiHangID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@MaSoHang", MaSoHang);
			if (QuocGiaID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", DBNull.Value);
			}
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemDatHangSimpleCoTamTinh(string WebsiteName, string username, string usernamesave, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, string loaitien, string ghichu, double tygia, double saleoff, bool HangKhoan, double cong, double? shipUSA, double tax, double phuthu, int? QuocGiaID)
	{
		try
		{
			OpenDatabase();
			bool result = ThemDatHangSimpleCoTamTinhKhongMoDB(WebsiteName, username, usernamesave, linkweb, linkhinh, corlor, size, soluong, dongiaweb, loaitien, ghichu, tygia, saleoff, HangKhoan, cong, shipUSA, tax, phuthu, QuocGiaID);
			CloseDatabase();
			return result;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemDatHangSimpleCoTamTinhKhongMoDB(string WebsiteName, string username, string usernamesave, string linkweb, string linkhinh, string corlor, string size, int soluong, double dongiaweb, string loaitien, string ghichu, double tygia, double saleoff, bool HangKhoan, double cong, double? shipUSA, double tax, double phuthu, int? QuocGiaID)
	{
		try
		{
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_DonHang_Simple_CoTamTinh";
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@usernamesave", usernamesave);
			base.CDBCommand.Parameters.AddWithValue("@linkweb", linkweb);
			base.CDBCommand.Parameters.AddWithValue("@linkhinh", linkhinh);
			base.CDBCommand.Parameters.AddWithValue("@corlor", corlor);
			base.CDBCommand.Parameters.AddWithValue("@size", size);
			base.CDBCommand.Parameters.AddWithValue("@soluong", soluong);
			base.CDBCommand.Parameters.AddWithValue("@dongiaweb", dongiaweb);
			base.CDBCommand.Parameters.AddWithValue("@loaitien", loaitien);
			base.CDBCommand.Parameters.AddWithValue("@ghichu", ghichu);
			base.CDBCommand.Parameters.AddWithValue("@tygia", tygia);
			base.CDBCommand.Parameters.AddWithValue("@saleoff", saleoff);
			base.CDBCommand.Parameters.AddWithValue("@HangKhoan", HangKhoan);
			base.CDBCommand.Parameters.AddWithValue("@cong", cong);
			if (shipUSA.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", shipUSA);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@shipUSA", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@tax", tax);
			base.CDBCommand.Parameters.AddWithValue("@phuthu", phuthu);
			if (QuocGiaID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", DBNull.Value);
			}
			base.CDBCommand.ExecuteNonQuery();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassDelete(string id, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_MassDelete";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassOrdered(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassOrdered";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaDonHang(int ID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_DonHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDonHangByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DonHangByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
		finally
		{
			CloseDatabase();
		}
	}

	public bool ShareOrders(string id, string ordernumber, double cong, double saleoff, double phuthu, double shipUSA, double tax, double TotalCharged, int TotalItem, bool HeThongTuTinhCong, double tygia, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_ShareOrders";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@ordernumber", ordernumber);
			base.CDBCommand.Parameters.AddWithValue("@cong", cong);
			base.CDBCommand.Parameters.AddWithValue("@saleoff", saleoff);
			base.CDBCommand.Parameters.AddWithValue("@phuthu", phuthu);
			base.CDBCommand.Parameters.AddWithValue("@shipUSA", shipUSA);
			base.CDBCommand.Parameters.AddWithValue("@tax", tax);
			base.CDBCommand.Parameters.AddWithValue("@TotalCharged", TotalCharged);
			base.CDBCommand.Parameters.AddWithValue("@TotalItem", TotalItem);
			base.CDBCommand.Parameters.AddWithValue("@HeThongTuTinhCong", HeThongTuTinhCong);
			base.CDBCommand.Parameters.AddWithValue("@tygia", tygia);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ShareOrdersHangKhoan(string id, string ordernumber, double TotalCharged, int TotalItem, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_ShareOrdersHangKhoan";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@ordernumber", ordernumber);
			base.CDBCommand.Parameters.AddWithValue("@TotalCharged", TotalCharged);
			base.CDBCommand.Parameters.AddWithValue("@TotalItem", TotalItem);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassCancel(string id, string ghichu, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassCancel";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@ghichu", ghichu);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassCancel1(string id, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassCancel1";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassReceived(string id, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassReceived";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassShipped(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassShipped";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassComplete(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassComplete";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ChuyenVeReceived(string ordernumber)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_ChuyenVeReceived";
			base.CDBCommand.Parameters.AddWithValue("@ordernumber", ordernumber);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemLinkHang(string WebsiteName, string username, string usernamesave, string linkweb)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_LinkHang";
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@usernamesave", usernamesave);
			base.CDBCommand.Parameters.AddWithValue("@linkweb", linkweb);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CanHang(int ID, int? LoaiHangID, double? CanHang_SoKg, double? CanHang_TienShipVeVN, double? CanHang_TienShipTrongNuoc, string CanHang_GhiChuShipVeVN, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CanHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			if (LoaiHangID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", LoaiHangID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", DBNull.Value);
			}
			if (CanHang_SoKg.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@CanHang_SoKg", CanHang_SoKg.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@CanHang_SoKg", DBNull.Value);
			}
			if (CanHang_TienShipVeVN.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@CanHang_TienShipVeVN", CanHang_TienShipVeVN.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@CanHang_TienShipVeVN", DBNull.Value);
			}
			if (CanHang_TienShipTrongNuoc.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@CanHang_TienShipTrongNuoc", CanHang_TienShipTrongNuoc.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@CanHang_TienShipTrongNuoc", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@CanHang_GhiChuShipVeVN", CanHang_GhiChuShipVeVN);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool BoSungGhiChu(string id, string BoSungGhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_BoSungGhiChu";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@BoSungGhiChu", BoSungGhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public int KiemTraDuocCapNhatDonHang(int ID, string UserName)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_KiemTra_DuocCapNhatDonHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			SqlParameter sqlParameter = base.CDBCommand.Parameters.Add("@DuocCapNhat", SqlDbType.Int);
			sqlParameter.Direction = ParameterDirection.ReturnValue;
			base.CDBCommand.ExecuteNonQuery();
			return Convert.ToInt32(sqlParameter.Value);
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public bool ThemThongTinWeb(string TenThongTin, string NoiDungThongTin)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_ThongTinWeb";
			base.CDBCommand.Parameters.AddWithValue("@TenThongTin", TenThongTin);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungThongTin", NoiDungThongTin);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatThongTinWeb(int ID, string TenThongTin, string NoiDungThongTin)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_ThongTinWeb";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@TenThongTin", TenThongTin);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungThongTin", NoiDungThongTin);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachThongTinWeb()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_ThongTinWeb";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayThongTinWebByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_ThongTinWebByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachWebsite()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_LayWebsite";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayWebsiteByReceived()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_LayWebsiteByReceived";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayUserByWebsiteReceived(string WebsiteName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_LayUserByWebsiteReceived";
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatWebsite(int ID, string WebsiteName, string GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_Website";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemWebsite(string WebsiteName, string GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_Website";
			base.CDBCommand.Parameters.AddWithValue("@WebsiteName", WebsiteName);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaWebsite(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_Website";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachTyGia()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_LayTyGia";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatTyGia(string Name, double TyGiaVND, double CongShipVeVN)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_TyGia";
			base.CDBCommand.Parameters.AddWithValue("@Name", Name);
			base.CDBCommand.Parameters.AddWithValue("@TyGiaVND", TyGiaVND);
			base.CDBCommand.Parameters.AddWithValue("@CongShipVeVN", CongShipVeVN);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public string LayTyGiaHienTaiTuDanhSachDonHang(string id)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_TyGiaHienTaiTuDanhSachDonHang";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			return obj?.ToString();
		}
		catch
		{
			return null;
		}
	}

	public bool ThemThacMac(string username, string CauHoi)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_ThacMac";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@CauHoi", CauHoi);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatCauHoiThacMac(int ID, string CauHoi)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_CauHoiThacMac";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@CauHoi", CauHoi);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatTraLoiThacMac(int ID, string TraLoi)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_TraLoiThacMac";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@TraLoi", TraLoi);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaThacMac(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_ThacMac";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachThacMac(string username, int DaTraLoi, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_ThacMac";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@DaTraLoi", DaTraLoi);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool Insert_CongNo(string sUsername, string sNoidung, DateTime? dNgaythem, double? dDR, double? dCR, string sGhichu, bool Status, int? LoHangID, string NguoiTao, int LoaiPhatSinh)
	{
		try
		{
			OpenDatabase();
			bool result = Insert_CongNoKhongMoDB(sUsername, sNoidung, dNgaythem, dDR, dCR, sGhichu, Status, LoHangID, NguoiTao, LoaiPhatSinh);
			CloseDatabase();
			return result;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool Insert_CongNoKhongMoDB(string sUsername, string sNoidung, DateTime? dNgaythem, double? dDR, double? dCR, string sGhichu, bool Status, int? LoHangID, string NguoiTao, int LoaiPhatSinh)
	{
		try
		{
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "CongNo_Insert";
			base.CDBCommand.Parameters.AddWithValue("@NoiDung", sNoidung);
			base.CDBCommand.Parameters.AddWithValue("@NgayGhiNo", dNgaythem);
			if (dDR.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@DR", dDR);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@DR", 0);
			}
			if (dCR.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@CR", dCR);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@CR", 0);
			}
			base.CDBCommand.Parameters.AddWithValue("@UserName", sUsername);
			base.CDBCommand.Parameters.AddWithValue("@Ghichu", sGhichu);
			base.CDBCommand.Parameters.AddWithValue("@Status", Status);
			if (LoHangID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@LoHangID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.Parameters.AddWithValue("@LoaiPhatSinh", LoaiPhatSinh);
			base.CDBCommand.ExecuteNonQuery();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatCongNo(int CongNo_ID, string sUsername, string sNoidung, double? dDR, double? dCR, string sGhichu, bool Status, int? LoHangID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			bool result = CapNhatCongNoKhongMoDB(CongNo_ID, sUsername, sNoidung, dDR, dCR, sGhichu, Status, LoHangID, NguoiTao, udUsername: true, udNoidung: true, udDR: true, udCR: true, udGhichu: true, udStatus: true, udLoHangID: true);
			CloseDatabase();
			return result;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatCongNoKhongMoDB(int CongNo_ID, string sUsername, string sNoidung, double? dDR, double? dCR, string sGhichu, bool Status, int? LoHangID, string NguoiTao, bool udUsername, bool udNoidung, bool udDR, bool udCR, bool udGhichu, bool udStatus, bool udLoHangID)
	{
		try
		{
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_CongNo";
			base.CDBCommand.Parameters.AddWithValue("@CongNo_ID", CongNo_ID);
			base.CDBCommand.Parameters.AddWithValue("@NoiDung", sNoidung);
			if (dDR.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@DR", dDR);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@DR", 0);
			}
			if (dCR.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@CR", dCR);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@CR", 0);
			}
			base.CDBCommand.Parameters.AddWithValue("@UserName", sUsername);
			base.CDBCommand.Parameters.AddWithValue("@Ghichu", sGhichu);
			base.CDBCommand.Parameters.AddWithValue("@Status", Status);
			if (LoHangID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@LoHangID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.Parameters.AddWithValue("@udUsername", udUsername);
			base.CDBCommand.Parameters.AddWithValue("@udNoidung", udNoidung);
			base.CDBCommand.Parameters.AddWithValue("@udDR", udDR);
			base.CDBCommand.Parameters.AddWithValue("@udCR", udCR);
			base.CDBCommand.Parameters.AddWithValue("@udGhichu", udGhichu);
			base.CDBCommand.Parameters.AddWithValue("@udStatus", udStatus);
			base.CDBCommand.Parameters.AddWithValue("@udLoHangID", udLoHangID);
			base.CDBCommand.ExecuteNonQuery();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatCongNoSimple(int CongNo_ID, string sNoidung, double? dDR, double? dCR, string sGhichu, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_CongNoSimple";
			base.CDBCommand.Parameters.AddWithValue("@CongNo_ID", CongNo_ID);
			base.CDBCommand.Parameters.AddWithValue("@NoiDung", sNoidung);
			if (dDR.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@DR", dDR);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@DR", 0);
			}
			if (dCR.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@CR", dCR);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@CR", 0);
			}
			base.CDBCommand.Parameters.AddWithValue("@Ghichu", sGhichu);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaCongNo(int CongNo_ID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_CongNo";
			base.CDBCommand.Parameters.AddWithValue("@CongNo_ID", CongNo_ID);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ApproveCongNo(int CongNo_ID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Approve_CongNo";
			base.CDBCommand.Parameters.AddWithValue("@CongNo_ID", CongNo_ID);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet DS_TOP_CongNo(string username, int status)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "CongNo_Top_DanhSach";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@Status", status);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachCongNo(string username, int status, int style, string NoiDungTim, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_CongNo";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@status", status);
			base.CDBCommand.Parameters.AddWithValue("@style", style);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachCongNo1(string username, int status, string LoaiPhatSinh, string NoiDungTim, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_CongNo1";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@status", status);
			base.CDBCommand.Parameters.AddWithValue("@LoaiPhatSinh", LoaiPhatSinh);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public int KiemTraDuocCapNhatCongNoByID(int ID, string UserName)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_KiemTra_DuocCapNhatCongNoByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			SqlParameter sqlParameter = base.CDBCommand.Parameters.Add("@DuocCapNhat", SqlDbType.Int);
			sqlParameter.Direction = ParameterDirection.ReturnValue;
			base.CDBCommand.ExecuteNonQuery();
			return Convert.ToInt32(sqlParameter.Value);
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public bool CapNhatNgayVeVN(string id, DateTime? NgayVeVN, string BoSungGhiChu, bool ChuyenSangComplete)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_NgayVeVN";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			if (NgayVeVN.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayVeVN", NgayVeVN.Value);
				base.CDBCommand.Parameters.AddWithValue("@TenDotHang", NgayVeVN.Value.ToString("yyyyMMdd"));
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayVeVN", DBNull.Value);
				base.CDBCommand.Parameters.AddWithValue("@TenDotHang", "");
			}
			base.CDBCommand.Parameters.AddWithValue("@BoSungGhiChu", BoSungGhiChu);
			base.CDBCommand.Parameters.AddWithValue("@ChuyenSangComplete", ChuyenSangComplete);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachWebLogo()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_WebLogo";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemWebLogo(string TenHinh, string NoiDung, string LinkWeb, int ThuTu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_WebLogo";
			base.CDBCommand.Parameters.AddWithValue("@TenHinh", TenHinh);
			base.CDBCommand.Parameters.AddWithValue("@NoiDung", NoiDung);
			base.CDBCommand.Parameters.AddWithValue("@LinkWeb", LinkWeb);
			base.CDBCommand.Parameters.AddWithValue("@ThuTu", ThuTu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayWebLogoByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_WebLogoByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatHinhAnhWebLogo(int ID, string TenHinh)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_HinhAnhWebLogo";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@TenHinh", TenHinh);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatWebLogo(int ID, string NoiDung, string LinkWeb, int ThuTu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_WebLogo";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@NoiDung", NoiDung);
			base.CDBCommand.Parameters.AddWithValue("@LinkWeb", LinkWeb);
			base.CDBCommand.Parameters.AddWithValue("@ThuTu", ThuTu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaWebLogo(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_WebLogo";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet BaoCaoChiTietCongNo(string username, int TuKyID, int DenKyID, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_ChiTietCongNo1";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@TuKyID", TuKyID);
			base.CDBCommand.Parameters.AddWithValue("@DenKyID", DenKyID);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoTongDoanhThu(DateTime TuNgay, DateTime DenNgay)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_TongDoanhThu";
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoTongCongNoTheoUser(string username, DateTime TuNgay, DateTime DenNgay)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_TongCongNoTheoUser";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoCongNoKhachHang()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_CongNoKhachHang";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoDoiChieuCongNo(string TuNgay, string DenNgay, string UserName, string OrderNumber)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_DoiChieuCongNo1";
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@OrderNumber", OrderNumber);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoCongNoTheoDotHang(DateTime TuNgay, DateTime DenNgay)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_CongNoTheoDotHang";
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoInPhieuShipTheoDotHang(string TenDotHang, string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_InPhieuShipTheoDotHang";
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoPhanTichLaiLoTheoLoHang(DateTime TuNgay, DateTime DenNgay)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_LaiLoTheoLo";
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet BaoCaoCongNoKhachHangTheoLoHang(DateTime TuNgay, DateTime DenNgay)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_BaoCao_CongNoKhachHangTheoLo";
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachShipper()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_Shipper";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemShipper(string ShipperName, string ShipperPhone, string ShipperAddress)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_Shipper";
			base.CDBCommand.Parameters.AddWithValue("@ShipperName", ShipperName);
			base.CDBCommand.Parameters.AddWithValue("@ShipperPhone", ShipperPhone);
			base.CDBCommand.Parameters.AddWithValue("@ShipperAddress", ShipperAddress);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayShipperByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_ShipperByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatShipper(int ID, string ShipperName, string ShipperPhone, string ShipperAddress)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_Shipper";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@ShipperName", ShipperName);
			base.CDBCommand.Parameters.AddWithValue("@ShipperPhone", ShipperPhone);
			base.CDBCommand.Parameters.AddWithValue("@ShipperAddress", ShipperAddress);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaShipper(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_Shipper";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachHangShip(string username, int YeuCauGuiHang, string NoiDungTim, int TimTheo, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_HangShip";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@YeuCauGuiHang", YeuCauGuiHang);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@TimTheo", TimTheo);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatYeuCauShipHang(string TenDotHang, string UserName, string YeuCauGui_GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_YeuCauShipHang";
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@YeuCauGui_GhiChu", YeuCauGui_GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatShipHang(string id, int ShipperID, DateTime? NgayGuiHang, string SoVanDon, double GuiHang_SoKg, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_ShipHang";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@ShipperID", ShipperID);
			if (NgayGuiHang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayGuiHang", NgayGuiHang.Value);
				base.CDBCommand.Parameters.AddWithValue("@TenDotHang", NgayGuiHang.Value.ToString("yyyyMMdd"));
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayGuiHang", DBNull.Value);
				base.CDBCommand.Parameters.AddWithValue("@TenDotHang", "");
			}
			base.CDBCommand.Parameters.AddWithValue("@SoVanDon", SoVanDon);
			base.CDBCommand.Parameters.AddWithValue("@GuiHang_SoKg", GuiHang_SoKg);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDotHangGui(string UserName, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DotHangGui";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatCompleteDotHang(string username, string TenDotHang)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_CompleteDotHang";
			base.CDBCommand.Parameters.AddWithValue("@username", username);
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayThongTinShipByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_ThongTinShipByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ClearDuLieuTheoUser(string UserName)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_ClearDuLieuTheoUser";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachListOrder(string OrderNumber, string TrackingNumber, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_ListOrder";
			base.CDBCommand.Parameters.AddWithValue("@OrderNumber", OrderNumber);
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatTrackingNumber(string ordernumber, string tracking_number, DateTime? NgayNhanTaiNuocNgoai, string TrackingLink)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_TrackingNumber";
			base.CDBCommand.Parameters.AddWithValue("@ordernumber", ordernumber);
			base.CDBCommand.Parameters.AddWithValue("@tracking_number", tracking_number);
			if (NgayNhanTaiNuocNgoai.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayNhanTaiNuocNgoai", NgayNhanTaiNuocNgoai.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayNhanTaiNuocNgoai", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@TrackingLink", TrackingLink);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatTongTienOrderVND(string ordernumber, string tracking_number, double TongTienOrderVND)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_TongTienOrderVND";
			base.CDBCommand.Parameters.AddWithValue("@ordernumber", ordernumber);
			base.CDBCommand.Parameters.AddWithValue("@tracking_number", tracking_number);
			base.CDBCommand.Parameters.AddWithValue("@TongTienOrderVND", TongTienOrderVND);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemHanMucKhachHang(string Username, bool DaQuaHanMuc, bool LaKhachVip)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_HanMucKhachHang";
			base.CDBCommand.Parameters.AddWithValue("@Username", Username);
			base.CDBCommand.Parameters.AddWithValue("@DaQuaHanMuc", DaQuaHanMuc);
			base.CDBCommand.Parameters.AddWithValue("@LaKhachVip", LaKhachVip);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatHanMucKhachHang(int ID, bool DaQuaHanMuc, bool LaKhachVip)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_HanMucKhachHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@DaQuaHanMuc", DaQuaHanMuc);
			base.CDBCommand.Parameters.AddWithValue("@LaKhachVip", LaKhachVip);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaHanMucKhachHang(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_HanMucKhachHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachHanMucKhachHang(string UserName, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_HanMucKhachHang";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public string LayNoConThieu(string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_NoConThieu";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			return obj?.ToString();
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachTaiKhoanNganHang()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_LayTaiKhoanNganHang";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatTaiKhoanNganHang(int ID, string TenTaiKhoanNganHang, string GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_TaiKhoanNganHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@TenTaiKhoanNganHang", TenTaiKhoanNganHang);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemTaiKhoanNganHang(string TenTaiKhoanNganHang, string GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_TaiKhoanNganHang";
			base.CDBCommand.Parameters.AddWithValue("@TenTaiKhoanNganHang", TenTaiKhoanNganHang);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDotHang(string TenDotHang, string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DotHang";
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDotHangDaYeuCau()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DotHangDaYeuCau";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachTenDotHang(DateTime TuNgay)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachTenDotHang";
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayTenDotHangByUserName(string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_TenDotHangByUserName";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDonHangUserTheoDotHang(string TenDotHang, string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "[SP_Lay_DonHangUserTheoDotHang]";
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatDotHang(string TenDotHang, string UserName, double CanNang, double PhiShipVeVN_USD, double TyGia, double PhiShipVeVN_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_CapNhatDotHang";
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@CanNang", CanNang);
			base.CDBCommand.Parameters.AddWithValue("@PhiShipVeVN_USD", PhiShipVeVN_USD);
			base.CDBCommand.Parameters.AddWithValue("@TyGia", TyGia);
			base.CDBCommand.Parameters.AddWithValue("@PhiShipVeVN_VND", PhiShipVeVN_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatDotHang_Ship(string TenDotHang, string UserName, int ShipperID, DateTime? NgayGuiHang, string SoVanDon, double PhiShipTrongNuoc, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_DotHang_Ship";
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@ShipperID", ShipperID);
			if (NgayGuiHang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayGuiHang", NgayGuiHang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayGuiHang", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@SoVanDon", SoVanDon);
			base.CDBCommand.Parameters.AddWithValue("@PhiShipTrongNuoc", PhiShipTrongNuoc);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatDotHang_Ship1(string TenDotHang, string UserName, int ShipperID, DateTime? NgayGuiHang, string SoVanDon, double PhiShipTrongNuoc, string DiaChiNhanHang, double DatCoc, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_DotHang_Ship1";
			base.CDBCommand.Parameters.AddWithValue("@TenDotHang", TenDotHang);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@ShipperID", ShipperID);
			if (NgayGuiHang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayGuiHang", NgayGuiHang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayGuiHang", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@SoVanDon", SoVanDon);
			base.CDBCommand.Parameters.AddWithValue("@PhiShipTrongNuoc", PhiShipTrongNuoc);
			base.CDBCommand.Parameters.AddWithValue("@DiaChiNhanHang", DiaChiNhanHang);
			base.CDBCommand.Parameters.AddWithValue("@DatCoc", DatCoc);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDotHangYeuCauShip(string UserName, int YeuCauGuiHang)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DotHangShip";
			base.CDBCommand.Parameters.AddWithValue("@username", UserName);
			base.CDBCommand.Parameters.AddWithValue("@YeuCauGuiHang", YeuCauGuiHang);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachHangCoSan()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_HangCoSan";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachHangCoSanPhanTrang(string NoiDungTim, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_HangCoSanPhanTrang";
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemHangCoSan(string TenHinh, string TenHang, string LinkHang, int? GiaTien, string MoTa, int? SoSao, int? ThuTu, string NoiDungTimKiem, string MaSoHang)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_HangCoSan";
			base.CDBCommand.Parameters.AddWithValue("@TenHinh", TenHinh);
			base.CDBCommand.Parameters.AddWithValue("@TenHang", TenHang);
			base.CDBCommand.Parameters.AddWithValue("@LinkHang", LinkHang);
			if (GiaTien.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@GiaTien", GiaTien.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@GiaTien", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@MoTa", MoTa);
			if (SoSao.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@SoSao", SoSao.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@SoSao", DBNull.Value);
			}
			if (ThuTu.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@ThuTu", ThuTu.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@ThuTu", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTimKiem", NoiDungTimKiem);
			base.CDBCommand.Parameters.AddWithValue("@MaSoHang", MaSoHang);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayHangCoSanByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_HangCoSanByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatHinhAnhHangCoSan(int ID, string TenHinh)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_HinhAnhHangCoSan";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@TenHinh", TenHinh);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatHangCoSan(int ID, string TenHang, string LinkHang, int? GiaTien, string MoTa, int? SoSao, int? ThuTu, string NoiDungTimKiem, string MaSoHang)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_HangCoSan";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@TenHang", TenHang);
			base.CDBCommand.Parameters.AddWithValue("@LinkHang", LinkHang);
			if (GiaTien.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@GiaTien", GiaTien.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@GiaTien", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@MoTa", MoTa);
			if (SoSao.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@SoSao", SoSao.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@SoSao", DBNull.Value);
			}
			if (ThuTu.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@ThuTu", ThuTu.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@ThuTu", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTimKiem", NoiDungTimKiem);
			base.CDBCommand.Parameters.AddWithValue("@MaSoHang", MaSoHang);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaHangCoSan(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_HangCoSan";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayGiaTienCong(string LoaiTien, double SoTien1Mon, bool KhachBuon)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_GiaTienCong";
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBCommand.Parameters.AddWithValue("@SoTien1Mon", SoTien1Mon);
			base.CDBCommand.Parameters.AddWithValue("@KhachBuon", KhachBuon);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachGiaTienCong()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachGiaTienCong";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemGiaTienCong(string LoaiTien, double TuGia, double DenGia, double TienCong1Mon, bool TinhTheoPhanTram, bool KhachBuon)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_GiaTienCong";
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBCommand.Parameters.AddWithValue("@TuGia", TuGia);
			base.CDBCommand.Parameters.AddWithValue("@DenGia", DenGia);
			base.CDBCommand.Parameters.AddWithValue("@TienCong1Mon", TienCong1Mon);
			base.CDBCommand.Parameters.AddWithValue("@TinhTheoPhanTram", TinhTheoPhanTram);
			base.CDBCommand.Parameters.AddWithValue("@KhachBuon", KhachBuon);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayGiaTienCongByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_GiaTienCongByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatGiaTienCong(int ID, string LoaiTien, double TuGia, double DenGia, double TienCong1Mon, bool TinhTheoPhanTram, bool KhachBuon)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_GiaTienCong";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBCommand.Parameters.AddWithValue("@TuGia", TuGia);
			base.CDBCommand.Parameters.AddWithValue("@DenGia", DenGia);
			base.CDBCommand.Parameters.AddWithValue("@TienCong1Mon", TienCong1Mon);
			base.CDBCommand.Parameters.AddWithValue("@TinhTheoPhanTram", TinhTheoPhanTram);
			base.CDBCommand.Parameters.AddWithValue("@KhachBuon", KhachBuon);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaGiaTienCong(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_GiaTienCong";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachLoaiHang()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_LayLoaiHang";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public int LayCongShipVeVN(int LoaiHangID, string LoaiTien, string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_CongShipVeVN";
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", LoaiHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return 0;
		}
		catch
		{
			return 0;
		}
	}

	public DataSet LayDanhSachCongShipVeVN()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachCongShipVeVN";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemCongShipVeVN(int LoaiHangID, string LoaiTien, double TienCongShipVeVN, bool KhachBuon)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_CongShipVeVN";
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", LoaiHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBCommand.Parameters.AddWithValue("@TienCongShipVeVN", TienCongShipVeVN);
			base.CDBCommand.Parameters.AddWithValue("@KhachBuon", KhachBuon);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayCongShipVeVNByID(int ID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_CongShipVeVNByID";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatCongShipVeVN(int ID, int LoaiHangID, string LoaiTien, double TienCongShipVeVN, bool KhachBuon)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_CongShipVeVN";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangID", LoaiHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBCommand.Parameters.AddWithValue("@TienCongShipVeVN", TienCongShipVeVN);
			base.CDBCommand.Parameters.AddWithValue("@KhachBuon", KhachBuon);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaCongShipVeVN(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_CongShipVeVN";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDiaChiNhanHangTheoUser(string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DiaChiNhanHangTheoUser";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachDiaChiNhanHang(string UserName, string NoiDungTim, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DiaChiNhanHang";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatDiaChiNhanHang(int ID, string UserName, string DiaChi)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_DiaChiNhanHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@DiaChi", DiaChi);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemDiaChiNhanHang(string UserName, string DiaChi)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_DiaChiNhanHang";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@DiaChi", DiaChi);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaDiaChiNhanHang(int ID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_DiaChiNhanHang";
			base.CDBCommand.Parameters.AddWithValue("@ID", ID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachLoHang(string UserName, DateTime? TuNgay, DateTime? DenNgay, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_LoHang";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			if (TuNgay.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@TuNgay", DBNull.Value);
			}
			if (DenNgay.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@DenNgay", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LaySoLuongLoHang(string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_SoLuongLoHang";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemLoHang(string UserName, string TrackingNumber, string OrderNumber, DateTime? NgayDatHang, int? NhaVanChuyenID, string TenLoHang, string TinhTrang, string GhiChu, string LoaiTien, double? TyGia, DateTime? NgayDenDuKien, DateTime? NgayDenThucTe, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_LoHang";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBCommand.Parameters.AddWithValue("@OrderNumber", OrderNumber);
			if (NgayDatHang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDatHang", NgayDatHang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDatHang", DBNull.Value);
			}
			if (NhaVanChuyenID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NhaVanChuyenID", NhaVanChuyenID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NhaVanChuyenID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@TenLoHang", TenLoHang);
			base.CDBCommand.Parameters.AddWithValue("@TinhTrang", TinhTrang);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			if (TyGia.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@TyGia", TyGia.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@TyGia", DBNull.Value);
			}
			if (NgayDenDuKien.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenDuKien", NgayDenDuKien.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenDuKien", DBNull.Value);
			}
			if (NgayDenThucTe.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenThucTe", NgayDenThucTe.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenThucTe", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatLoHang(int LoHangID, string UserName, string LoaiTien, double? TyGia, DateTime? NgayDenDuKien, DateTime? NgayDenThucTe, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_LoHang";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			if (TyGia.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@TyGia", TyGia.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@TyGia", DBNull.Value);
			}
			if (NgayDenDuKien.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenDuKien", NgayDenDuKien.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenDuKien", DBNull.Value);
			}
			if (NgayDenThucTe.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenThucTe", NgayDenThucTe.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDenThucTe", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaLoHang(int LoHangID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_LoHang";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayLoHangByID(int LoHangID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_LoHangByID";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
		finally
		{
			CloseDatabase();
		}
	}

	public DataSet LayDanhSachLoHangTheoUser(string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachLoHangTheoUser";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachNhaVanChuyen()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_NhaVanChuyen";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachQuocGia()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_QuocGia";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachLoaiHangShip()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_LoaiHangShip";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachLoaiHangShipByLoaiTien(string LoaiTien)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_LoaiHangShipByLoaiTien";
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachLoHang_PhiShipVeVNByID(int LoHangID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachLoHang_PhiShipVeVNByID";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemLoHang_PhiShipVeVN(int LoHangID, int LoaiHangShipID, double CanNang, int DonGia, int TongTienShipVeVN_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_LoHang_PhiShipVeVN";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangShipID", LoaiHangShipID);
			base.CDBCommand.Parameters.AddWithValue("@CanNang", CanNang);
			base.CDBCommand.Parameters.AddWithValue("@DonGia", DonGia);
			base.CDBCommand.Parameters.AddWithValue("@TongTienShipVeVN_VND", TongTienShipVeVN_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemLoHang_PhiShipVeVN_ThanhTien(int LoHangID, int LoaiHangShipID, int TongTienShipVeVN_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_LoHang_PhiShipVeVN_ThanhTien";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangShipID", LoaiHangShipID);
			base.CDBCommand.Parameters.AddWithValue("@TongTienShipVeVN_VND", TongTienShipVeVN_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatLoHang_PhiShipVeVN(int LoHang_PhiShipVeVNID, int LoHangID, int LoaiHangShipID, double CanNang, int DonGia, int TongTienShipVeVN_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_LoHang_PhiShipVeVN";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_PhiShipVeVNID", LoHang_PhiShipVeVNID);
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangShipID", LoaiHangShipID);
			base.CDBCommand.Parameters.AddWithValue("@CanNang", CanNang);
			base.CDBCommand.Parameters.AddWithValue("@DonGia", DonGia);
			base.CDBCommand.Parameters.AddWithValue("@TongTienShipVeVN_VND", TongTienShipVeVN_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatLoHang_PhiShipVeVN_ThanhTien(int LoHang_PhiShipVeVNID, int LoHangID, int LoaiHangShipID, int TongTienShipVeVN_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_LoHang_PhiShipVeVN_ThanhTien";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_PhiShipVeVNID", LoHang_PhiShipVeVNID);
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangShipID", LoaiHangShipID);
			base.CDBCommand.Parameters.AddWithValue("@TongTienShipVeVN_VND", TongTienShipVeVN_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaLoHang_PhiShipVeVN(int LoHang_PhiShipVeVNID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_LoHang_PhiShipVeVN";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_PhiShipVeVNID", LoHang_PhiShipVeVNID);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public double LayDonGiaLoaiHangShip(int LoaiHangShipID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DonGiaLoaiHangShip";
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangShipID", LoaiHangShipID);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToDouble(obj);
			}
			return 0.0;
		}
		catch
		{
			return 0.0;
		}
	}

	public DataSet LayDanhSachLoaiHangThueHaiQuan()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_LoaiHangThueHaiQuan";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachLoaiHangThueHaiQuanByLoaiTien(string LoaiTien)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_LoaiHangThueHaiQuanByLoaiTien";
			base.CDBCommand.Parameters.AddWithValue("@LoaiTien", LoaiTien);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachLoHang_ThueHaiQuanByID(int LoHangID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachLoHang_ThueHaiQuanByID";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemLoHang_ThueHaiQuan(int LoHangID, int LoaiHangThueHaiQuanID, double CanNangSoLuongGiaTri, double DonGia, int TongTienThueHaiQuan_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_LoHang_ThueHaiQuan";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangThueHaiQuanID", LoaiHangThueHaiQuanID);
			base.CDBCommand.Parameters.AddWithValue("@CanNangSoLuongGiaTri", CanNangSoLuongGiaTri);
			base.CDBCommand.Parameters.AddWithValue("@DonGia", DonGia);
			base.CDBCommand.Parameters.AddWithValue("@TongTienThueHaiQuan_VND", TongTienThueHaiQuan_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemLoHang_ThueHaiQuan_ThanhTien(int LoHangID, int LoaiHangThueHaiQuanID, int TongTienThueHaiQuan_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_LoHang_ThueHaiQuan_ThanhTien";
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangThueHaiQuanID", LoaiHangThueHaiQuanID);
			base.CDBCommand.Parameters.AddWithValue("@TongTienThueHaiQuan_VND", TongTienThueHaiQuan_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatLoHang_ThueHaiQuan(int LoHang_ThueHaiQuanID, int LoHangID, int LoaiHangThueHaiQuanID, double CanNangSoLuongGiaTri, double DonGia, int TongTienThueHaiQuan_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_LoHang_ThueHaiQuan";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_ThueHaiQuanID", LoHang_ThueHaiQuanID);
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangThueHaiQuanID", LoaiHangThueHaiQuanID);
			base.CDBCommand.Parameters.AddWithValue("@CanNangSoLuongGiaTri", CanNangSoLuongGiaTri);
			base.CDBCommand.Parameters.AddWithValue("@DonGia", DonGia);
			base.CDBCommand.Parameters.AddWithValue("@TongTienThueHaiQuan_VND", TongTienThueHaiQuan_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatLoHang_ThueHaiQuan_ThanhTien(int LoHang_ThueHaiQuanID, int LoHangID, int LoaiHangThueHaiQuanID, int TongTienThueHaiQuan_VND, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_LoHang_ThueHaiQuan_ThanhTien";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_ThueHaiQuanID", LoHang_ThueHaiQuanID);
			base.CDBCommand.Parameters.AddWithValue("@LoHangID", LoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangThueHaiQuanID", LoaiHangThueHaiQuanID);
			base.CDBCommand.Parameters.AddWithValue("@TongTienThueHaiQuan_VND", TongTienThueHaiQuan_VND);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaLoHang_ThueHaiQuan(int LoHang_ThueHaiQuanID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_LoHang_ThueHaiQuan";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_ThueHaiQuanID", LoHang_ThueHaiQuanID);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public double LayDonGiaLoaiHangThueHaiQuan(int LoaiHangThueHaiQuanID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DonGiaLoaiHangThueHaiQuan";
			base.CDBCommand.Parameters.AddWithValue("@LoaiHangThueHaiQuanID", LoaiHangThueHaiQuanID);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToDouble(obj);
			}
			return 0.0;
		}
		catch
		{
			return 0.0;
		}
	}

	public DataSet LayDanhSachTracking(string UserName, string TinhTrang, string NoiDungTim, int TimTheo, string TrackingNumber, string TenLoHang, int QuocGiaID, bool DaXoa, string TuNgay, string DenNgay, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_Tracking";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@TinhTrang", TinhTrang);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@TimTheo", TimTheo);
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBCommand.Parameters.AddWithValue("@TenLoHang", TenLoHang);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID);
			base.CDBCommand.Parameters.AddWithValue("@DaXoa", DaXoa);
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LaySoLuongTracking(string UserName)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_SoLuongTracking";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemTracking(string UserName, string TrackingNumber, string OrderNumber, DateTime? NgayDatHang, int? NhaVanChuyenID, int? QuocGiaID, string TinhTrang, string GhiChu, string NguoiTao, string Kien, string Mawb, string Hawb)
	{
		try
		{
			OpenDatabase();
			bool result = ThemTrackingKhongMoDB(UserName, TrackingNumber, OrderNumber, NgayDatHang, NhaVanChuyenID, QuocGiaID, TinhTrang, GhiChu, NguoiTao, Kien, Mawb, Hawb, CoTaoLoHang: false, "");
			CloseDatabase();
			return result;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemTrackingKhongMoDB(string UserName, string TrackingNumber, string OrderNumber, DateTime? NgayDatHang, int? NhaVanChuyenID, int? QuocGiaID, string TinhTrang, string GhiChu, string NguoiTao, string Kien, string Mawb, string Hawb, bool CoTaoLoHang, string GhiChuLoHang)
	{
		try
		{
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_Tracking";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBCommand.Parameters.AddWithValue("@OrderNumber", OrderNumber);
			if (NgayDatHang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDatHang", NgayDatHang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDatHang", DBNull.Value);
			}
			if (NhaVanChuyenID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NhaVanChuyenID", NhaVanChuyenID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NhaVanChuyenID", DBNull.Value);
			}
			if (QuocGiaID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@TinhTrang", TinhTrang);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.Parameters.AddWithValue("@Kien", Kien);
			base.CDBCommand.Parameters.AddWithValue("@Mawb", Mawb);
			base.CDBCommand.Parameters.AddWithValue("@Hawb", Hawb);
			base.CDBCommand.Parameters.AddWithValue("@CoTaoLoHang", CoTaoLoHang);
			base.CDBCommand.Parameters.AddWithValue("@GhiChuLoHang", GhiChuLoHang);
			base.CDBCommand.ExecuteNonQuery();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public int LayTrackingIDByTrackingNumber(string TrackingNumber)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_TrackingIDByTrackingNumber";
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBAdapter.SelectCommand = myCommand;
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return -1;
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public bool CapNhatTracking(int TrackingID, string UserName, string TrackingNumber, string OrderNumber, DateTime? NgayDatHang, int? NhaVanChuyenID, int? QuocGiaID, string TinhTrang, string GhiChu, string NguoiTao, string Kien, string Mawb, string Hawb)
	{
		try
		{
			OpenDatabase();
			bool result = CapNhatTrackingKhongMoDB(TrackingID, UserName, TrackingNumber, OrderNumber, NgayDatHang, NhaVanChuyenID, QuocGiaID, TinhTrang, GhiChu, NguoiTao, Kien, Mawb, Hawb, CoTaoLoHang: false, "", udQuocGiaID: true, udUserName: true, udOrderNumber: true, udNgayDatHang: true, udNhaVanChuyenID: true, udTinhTrang: true, udGhiChu: true, udKien: true, udMawb: true, udHawb: true, udGhiChuLoHang: false);
			CloseDatabase();
			return result;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatTrackingKhongMoDB(int TrackingID, string UserName, string TrackingNumber, string OrderNumber, DateTime? NgayDatHang, int? NhaVanChuyenID, int? QuocGiaID, string TinhTrang, string GhiChu, string NguoiTao, string Kien, string Mawb, string Hawb, bool CoTaoLoHang, string GhiChuLoHang, bool udQuocGiaID, bool udUserName, bool udOrderNumber, bool udNgayDatHang, bool udNhaVanChuyenID, bool udTinhTrang, bool udGhiChu, bool udKien, bool udMawb, bool udHawb, bool udGhiChuLoHang)
	{
		try
		{
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_Tracking";
			base.CDBCommand.Parameters.AddWithValue("@TrackingID", TrackingID);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBCommand.Parameters.AddWithValue("@OrderNumber", OrderNumber);
			if (NgayDatHang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDatHang", NgayDatHang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayDatHang", DBNull.Value);
			}
			if (NhaVanChuyenID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NhaVanChuyenID", NhaVanChuyenID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NhaVanChuyenID", DBNull.Value);
			}
			if (QuocGiaID.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@TinhTrang", TinhTrang);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.Parameters.AddWithValue("@Kien", Kien);
			base.CDBCommand.Parameters.AddWithValue("@Mawb", Mawb);
			base.CDBCommand.Parameters.AddWithValue("@Hawb", Hawb);
			base.CDBCommand.Parameters.AddWithValue("@CoTaoLoHang", CoTaoLoHang);
			base.CDBCommand.Parameters.AddWithValue("@GhiChuLoHang", GhiChuLoHang);
			base.CDBCommand.Parameters.AddWithValue("@udQuocGiaID", udQuocGiaID);
			base.CDBCommand.Parameters.AddWithValue("@udUserName", udUserName);
			base.CDBCommand.Parameters.AddWithValue("@udOrderNumber", udOrderNumber);
			base.CDBCommand.Parameters.AddWithValue("@udNgayDatHang", udNgayDatHang);
			base.CDBCommand.Parameters.AddWithValue("@udNhaVanChuyenID", udNhaVanChuyenID);
			base.CDBCommand.Parameters.AddWithValue("@udTinhTrang", udTinhTrang);
			base.CDBCommand.Parameters.AddWithValue("@udGhiChu", udGhiChu);
			base.CDBCommand.Parameters.AddWithValue("@udKien", udKien);
			base.CDBCommand.Parameters.AddWithValue("@udMawb", udMawb);
			base.CDBCommand.Parameters.AddWithValue("@udHawb", udHawb);
			base.CDBCommand.Parameters.AddWithValue("@udGhiChuLoHang", udGhiChuLoHang);
			base.CDBCommand.ExecuteNonQuery();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaTracking(int TrackingID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_Tracking";
			base.CDBCommand.Parameters.AddWithValue("@TrackingID", TrackingID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayTrackingByID(int TrackingID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_TrackingByID";
			base.CDBCommand.Parameters.AddWithValue("@TrackingID", TrackingID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
		finally
		{
			CloseDatabase();
		}
	}

	public bool MassDeleteTracking(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_MassDeleteTracking";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassCancelTracking(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassCancelTracking";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassReceivedTracking(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassReceivedTracking";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassShippedTracking(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassShippedTracking";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassCompleteTracking(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassCompleteTracking";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassInTransitTracking(string id)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassInTransitTracking";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatNgayLoHang(string id, DateTime? NgayLoHang, string GhiChu)
	{
		try
		{
			OpenDatabase();
			bool result = CapNhatNgayLoHang(id, NgayLoHang, GhiChu);
			CloseDatabase();
			return result;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatNgayLoHangKhongMoDB(string id, DateTime? NgayLoHang, string GhiChu)
	{
		try
		{
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_NgayLoHang";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			if (NgayLoHang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayLoHang", NgayLoHang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayLoHang", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachChiTietTrackingByID(int TrackingID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachChiTietTrackingByID";
			base.CDBCommand.Parameters.AddWithValue("@TrackingID", TrackingID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemChiTietTracking(int TrackingID, string LinkHinhDaiDien, int SoLuong, double? Gia, string GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_ChiTietTracking";
			base.CDBCommand.Parameters.AddWithValue("@TrackingID", TrackingID);
			base.CDBCommand.Parameters.AddWithValue("@LinkHinhDaiDien", LinkHinhDaiDien);
			base.CDBCommand.Parameters.AddWithValue("@SoLuong", SoLuong);
			if (Gia.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@Gia", Gia.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@Gia", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatChiTietTracking(int ChiTietTrackingID, string LinkHinhDaiDien, int SoLuong, double? Gia, string GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_ChiTietTracking";
			base.CDBCommand.Parameters.AddWithValue("@ChiTietTrackingID", ChiTietTrackingID);
			base.CDBCommand.Parameters.AddWithValue("@LinkHinhDaiDien", LinkHinhDaiDien);
			base.CDBCommand.Parameters.AddWithValue("@SoLuong", SoLuong);
			if (Gia.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@Gia", Gia.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@Gia", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaChiTietTracking(int ChiTietTrackingID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_ChiTietTracking";
			base.CDBCommand.Parameters.AddWithValue("@ChiTietTrackingID", ChiTietTrackingID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassStatusTracking(string id, string TinhTrang, DateTime? NgayChuyenTinhTrang, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassStatusTracking";
			base.CDBCommand.Parameters.AddWithValue("@id", id);
			base.CDBCommand.Parameters.AddWithValue("@TinhTrang", TinhTrang);
			if (NgayChuyenTinhTrang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayChuyenTinhTrang", NgayChuyenTinhTrang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayChuyenTinhTrang", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachTinhTrangTrackingByID(int TrackingID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachTinhTrangTrackingByID";
			base.CDBCommand.Parameters.AddWithValue("@TrackingID", TrackingID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachTinhTrangTrackingByNumber(string TrackingNumber)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachTinhTrangTrackingByNumber";
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool CapNhatTinhTrangTracking(int TinhTrangTrackingID, string GhiChu)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_TinhTrangTracking";
			base.CDBCommand.Parameters.AddWithValue("@TinhTrangTrackingID", TinhTrangTrackingID);
			base.CDBCommand.Parameters.AddWithValue("@GhiChu", GhiChu);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaTinhTrangTracking(int TinhTrangTrackingID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_TinhTrangTracking";
			base.CDBCommand.Parameters.AddWithValue("@TinhTrangTrackingID", TinhTrangTrackingID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool MassStatusAllTrackingWithFilter(string UserName, string TinhTrangFilter, string NoiDungTim, int TimTheo, string TrackingNumber, string TenLoHang, int QuocGiaID, bool DaXoa, string TuNgay, string DenNgay, string TinhTrang, DateTime? NgayChuyenTinhTrang, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_MassStatusAllTrackingWithFilter";
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@TinhTrangFilter", TinhTrangFilter);
			base.CDBCommand.Parameters.AddWithValue("@NoiDungTim", NoiDungTim);
			base.CDBCommand.Parameters.AddWithValue("@TimTheo", TimTheo);
			base.CDBCommand.Parameters.AddWithValue("@TrackingNumber", TrackingNumber);
			base.CDBCommand.Parameters.AddWithValue("@TenLoHang", TenLoHang);
			base.CDBCommand.Parameters.AddWithValue("@QuocGiaID", QuocGiaID);
			base.CDBCommand.Parameters.AddWithValue("@DaXoa", DaXoa);
			base.CDBCommand.Parameters.AddWithValue("@TuNgay", TuNgay);
			base.CDBCommand.Parameters.AddWithValue("@DenNgay", DenNgay);
			base.CDBCommand.Parameters.AddWithValue("@TinhTrang", TinhTrang);
			if (NgayChuyenTinhTrang.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayChuyenTinhTrang", NgayChuyenTinhTrang.Value);
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@NgayChuyenTinhTrang", DBNull.Value);
			}
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet LayDanhSachLoaiChiPhiLoHang()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_LoaiChiPhiLoHang";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public DataSet LayDanhSachLoHang_ChiPhiLoHangByID(string TenLoHang)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_DanhSachLoHang_ChiPhiLoHangByID";
			base.CDBCommand.Parameters.AddWithValue("@TenLoHang", TenLoHang);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public bool ThemLoHang_ChiPhiLoHang(string TenLoHang, int LoaiChiPhiLoHangID, double TienVND)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_LoHang_ChiPhiLoHang";
			base.CDBCommand.Parameters.AddWithValue("@TenLoHang", TenLoHang);
			base.CDBCommand.Parameters.AddWithValue("@LoaiChiPhiLoHangID", LoaiChiPhiLoHangID);
			base.CDBCommand.Parameters.AddWithValue("@TienVND", TienVND);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool CapNhatLoHang_ChiPhiLoHang(int LoHang_ChiPhiLoHangID, int LoaiChiPhiLoHangID, double TienVND)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_LoHang_ChiPhiLoHang";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_ChiPhiLoHangID", LoHang_ChiPhiLoHangID);
			base.CDBCommand.Parameters.AddWithValue("@LoaiChiPhiLoHangID", LoaiChiPhiLoHangID);
			base.CDBCommand.Parameters.AddWithValue("@TienVND", TienVND);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool XoaLoHang_ChiPhiLoHang(int LoHang_ChiPhiLoHangID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_LoHang_ChiPhiLoHang";
			base.CDBCommand.Parameters.AddWithValue("@LoHang_ChiPhiLoHangID", LoHang_ChiPhiLoHangID);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemSystemLogs(string NguoiTao, string Nguon, string HanhDong, string DoiTuong, string NoiDung)
	{
		try
		{
			OpenDatabase();
			ThemSystemLogsKhongMoDB(NguoiTao, Nguon, HanhDong, DoiTuong, NoiDung);
			CloseDatabase();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public bool ThemSystemLogsKhongMoDB(string NguoiTao, string Nguon, string HanhDong, string DoiTuong, string NoiDung)
	{
		try
		{
			base.CDBCommand.Parameters.Clear();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_SystemLogs";
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.Parameters.AddWithValue("@Nguon", Nguon);
			base.CDBCommand.Parameters.AddWithValue("@HanhDong", HanhDong);
			base.CDBCommand.Parameters.AddWithValue("@DoiTuong", DoiTuong);
			base.CDBCommand.Parameters.AddWithValue("@NoiDung", NoiDung);
			base.CDBCommand.ExecuteNonQuery();
			return true;
		}
		catch (Exception)
		{
			return false;
		}
	}

	public DataSet TimKiemSystemLogs(string NguoiTao, string Nguon, string HanhDong, string DoiTuong, string NoiDung, DateTime? TuNgay, DateTime? DenNgay, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_TimKiemSystemLogs";
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			base.CDBCommand.Parameters.AddWithValue("@Nguon", Nguon);
			base.CDBCommand.Parameters.AddWithValue("@HanhDong", HanhDong);
			base.CDBCommand.Parameters.AddWithValue("@DoiTuong", DoiTuong);
			if (TuNgay.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@TuNgay", DateTimeUtil.getFullSqlDatetime(TuNgay.Value));
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@TuNgay", "");
			}
			if (DenNgay.HasValue)
			{
				base.CDBCommand.Parameters.AddWithValue("@DenNgay", DateTimeUtil.getFullSqlDatetime(DenNgay.Value));
			}
			else
			{
				base.CDBCommand.Parameters.AddWithValue("@DenNgay", "");
			}
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBCommand.Parameters.AddWithValue("@NoiDung", NoiDung);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public DataSet LaySystemLogsLienQuan(string DoiTuong)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_SystemLogsLienQuan";
			base.CDBCommand.Parameters.AddWithValue("@DoiTuong", DoiTuong);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public DataSet LayDanhSachKy()
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_Ky";
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public DataSet LayDanhSachKyByTinhTrang(bool DaDong)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_KyByTinhTrang";
			base.CDBCommand.Parameters.AddWithValue("@DaDong", DaDong);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public DataSet LayKyByID(int KyID)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_KyByID";
			base.CDBCommand.Parameters.AddWithValue("@KyID", KyID);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch (Exception)
		{
			return null;
		}
	}

	public int XoaKy(int KyID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Xoa_Ky";
			base.CDBCommand.Parameters.AddWithValue("@KyID", KyID);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return -1;
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public int ThemKy(int Thang, int Nam)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Them_Ky";
			base.CDBCommand.Parameters.AddWithValue("@Thang", Thang);
			base.CDBCommand.Parameters.AddWithValue("@Nam", Nam);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return -1;
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public int SuaKy(int KyID, int Thang, int Nam)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Sua_Ky";
			base.CDBCommand.Parameters.AddWithValue("@KyID", KyID);
			base.CDBCommand.Parameters.AddWithValue("@Thang", Thang);
			base.CDBCommand.Parameters.AddWithValue("@Nam", Nam);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return -1;
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public int DongKy(int KyCanDongID, string UserName, bool LaKyDauTien, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_DongKy";
			base.CDBCommand.Parameters.AddWithValue("@KyCanDongID", KyCanDongID);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@LaKyDauTien", LaKyDauTien);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return -1;
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public DataSet LayDanhSachChotKy(int KyID, string UserName, int TamMoKy, int PageSize, int PageNum)
	{
		try
		{
			OpenDatabase();
			DataSet dataSet = new DataSet();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_ChotKyPhanTrang";
			base.CDBCommand.Parameters.AddWithValue("@KyID", KyID);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			base.CDBCommand.Parameters.AddWithValue("@TamMoKy", TamMoKy);
			base.CDBCommand.Parameters.AddWithValue("@PageSize", PageSize);
			base.CDBCommand.Parameters.AddWithValue("@PageNum", PageNum);
			base.CDBAdapter.SelectCommand = myCommand;
			base.CDBAdapter.Fill(dataSet);
			CloseDatabase();
			return dataSet;
		}
		catch
		{
			return null;
		}
	}

	public int TamMoKy(int ChotKyID)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_TamMoKy";
			base.CDBCommand.Parameters.AddWithValue("@ChotKyID", ChotKyID);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return -1;
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public int DongKyMoTam(int ChotKyID, string NguoiTao)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_DongKyMoTam";
			base.CDBCommand.Parameters.AddWithValue("@ChotKyID", ChotKyID);
			base.CDBCommand.Parameters.AddWithValue("@NguoiTao", NguoiTao);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return Convert.ToInt32(obj);
			}
			return -1;
		}
		catch (Exception)
		{
			return -1;
		}
	}

	public int KiemTraDuocCapNhatCongNo(DateTime NgayGhiNo, string UserName)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_KiemTra_DuocCapNhatCongNo";
			base.CDBCommand.Parameters.AddWithValue("@NgayGhiNo", NgayGhiNo);
			base.CDBCommand.Parameters.AddWithValue("@UserName", UserName);
			SqlParameter sqlParameter = base.CDBCommand.Parameters.Add("@DuocCapNhat", SqlDbType.Int);
			sqlParameter.Direction = ParameterDirection.ReturnValue;
			base.CDBCommand.ExecuteNonQuery();
			return Convert.ToInt32(sqlParameter.Value);
		}
		catch (Exception)
		{
			return -1;
		}
	}
}
