using System;
using System.Data;

public class DBCauHinh : DataProvider
{
	public string PhiShipHang
	{
		get
		{
			string settingId = GetSettingId("PhiShipHang");
			if (!string.IsNullOrEmpty(settingId))
			{
				return settingId.ToString();
			}
			return "";
		}
		set
		{
			SetSettingId("PhiShipHang", value.ToString());
		}
	}

	public double Thue
	{
		get
		{
			string settingId = GetSettingId("Thue");
			if (!string.IsNullOrEmpty(settingId))
			{
				return Convert.ToDouble(settingId);
			}
			return 0.0;
		}
		set
		{
			SetSettingId("Thue", value.ToString());
		}
	}

	private string GetSettingId(string TenCauHinh)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_Lay_CauHinh";
			base.CDBCommand.Parameters.AddWithValue("@TenCauHinh", TenCauHinh);
			object obj = base.CDBCommand.ExecuteScalar();
			CloseDatabase();
			if (obj != null)
			{
				return obj.ToString();
			}
			return "";
		}
		catch (Exception)
		{
			return "";
		}
	}

	private bool SetSettingId(string TenCauHinh, string GiaTriCauHinh)
	{
		try
		{
			OpenDatabase();
			base.CDBCommand.CommandType = CommandType.StoredProcedure;
			base.CDBCommand.CommandText = "SP_CapNhat_CauHinh";
			base.CDBCommand.Parameters.AddWithValue("@TenCauHinh", TenCauHinh);
			base.CDBCommand.Parameters.AddWithValue("@GiaTriCauHinh", GiaTriCauHinh);
			base.CDBCommand.ExecuteNonQuery();
			CloseDatabase();
		}
		catch
		{
			return false;
		}
		return true;
	}
}
