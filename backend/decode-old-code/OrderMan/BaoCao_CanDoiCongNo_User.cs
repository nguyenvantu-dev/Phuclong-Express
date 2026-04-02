using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class BaoCao_CanDoiCongNo_User : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected Label lblTienMuaHang_A;

	protected Label lblTienDaTra_B;

	protected Label lblTienCompleted_C;

	protected Label lblTienNo_E;

	protected Label lblTienHangChuaVe_F;

	protected GridView gvCongNo;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadBaoCaoChiTietCongNo();
		}
	}

	private void LoadBaoCaoChiTietCongNo()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.BaoCaoChiTietCongNo(base.User.Identity.GetUserName(), -1, -1, pageSize, pageNum);
			if (dataSet != null && dataSet.Tables.Count > 1)
			{
				gvCongNo.DataSource = dataSet.Tables[1];
				gvCongNo.DataBind();
				myPager.BuildPaging(pageNum, Convert.ToInt32(dataSet.Tables[0].Rows[0][0]), pageSize);
				DataTable dataTable = dataSet.Tables[2];
				double num = 0.0;
				double num2 = 0.0;
				double num3 = 0.0;
				double num4 = 0.0;
				DataRow[] array = dataTable.Select("Loai = 'A'");
				if (array != null && array.Length != 0)
				{
					num = ((array[0]["SoTien"] == DBNull.Value) ? 0.0 : Convert.ToDouble(array[0]["SoTien"]));
				}
				array = dataTable.Select("Loai = 'B'");
				if (array != null && array.Length != 0)
				{
					num2 = ((array[0]["SoTien"] == DBNull.Value) ? 0.0 : Convert.ToDouble(array[0]["SoTien"]));
				}
				array = dataTable.Select("Loai = 'C'");
				if (array != null && array.Length != 0)
				{
					num3 = ((array[0]["SoTien"] == DBNull.Value) ? 0.0 : Convert.ToDouble(array[0]["SoTien"]));
				}
				array = dataTable.Select("Loai = 'F'");
				if (array != null && array.Length != 0)
				{
					num4 = ((array[0]["SoTien"] == DBNull.Value) ? 0.0 : Convert.ToDouble(array[0]["SoTien"]));
				}
				double num5 = (num - num3) * 1.0 - (num2 - num3);
				if (num5 < 0.0)
				{
					num5 = 0.0;
				}
				double num6 = num - num2;
				lblTienMuaHang_A.Text = num.ToString("N0");
				lblTienDaTra_B.Text = num2.ToString("N0");
				lblTienCompleted_C.Text = num3.ToString("N0");
				lblTienNo_E.Text = num6.ToString("N0");
				lblTienHangChuaVe_F.Text = num4.ToString("N0");
			}
		}
		catch
		{
		}
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadBaoCaoChiTietCongNo();
	}
}
