using System;
using System.Data;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class ThongTinDotHang : Page
{
	protected DropDownList ddDotHang;

	protected Button btTimKiem;

	protected Label lbNgayVeVN;

	protected Label lbtongtienUSD;

	protected Label lbtongtienVND;

	protected Label lbPhiShipVeVN_VND;

	protected Label lbPhiShipTrongNuoc;

	protected Label lbTongTienThanhToan;

	protected Label lbCanNang;

	protected GridView gvDonHang;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataDotHang();
		}
	}

	private void LoadDataDotHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddDotHang.DataSource = dBConnect.LayTenDotHangByUserName(base.User.Identity.GetUserName());
			ddDotHang.DataBind();
		}
		catch
		{
		}
	}

	private void LoadDanhSachDonHang()
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayDonHangUserTheoDotHang(ddDotHang.SelectedValue, base.User.Identity.GetUserName());
		if (dataSet != null && dataSet.Tables.Count > 0)
		{
			gvDonHang.DataSource = dataSet.Tables[0];
			gvDonHang.DataBind();
			double num = (from c in dataSet.Tables[0].AsEnumerable()
				where !c.IsNull("tongtienUSD")
				select c.Field<double>("tongtienUSD")).Sum();
			double num2 = (from c in dataSet.Tables[0].AsEnumerable()
				where !c.IsNull("tongtienVND")
				select c.Field<double>("tongtienVND")).Sum();
			double num3 = ((dataSet.Tables[1].Rows[0]["PhiShipVeVN_VND"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataSet.Tables[1].Rows[0]["PhiShipVeVN_VND"]));
			double num4 = ((dataSet.Tables[1].Rows[0]["PhiShipTrongNuoc"] == DBNull.Value) ? 0.0 : Convert.ToDouble(dataSet.Tables[1].Rows[0]["PhiShipTrongNuoc"]));
			lbNgayVeVN.Text = ((DateTime)dataSet.Tables[1].Rows[0]["NgayVeVN"]).ToString("dd/MM/yyyy");
			lbtongtienUSD.Text = num.ToString("N2");
			lbtongtienVND.Text = num2.ToString("N0");
			lbPhiShipVeVN_VND.Text = num3.ToString("N0");
			lbPhiShipTrongNuoc.Text = num4.ToString("N0");
			lbTongTienThanhToan.Text = (num2 + num3 + num4).ToString("N0");
			lbCanNang.Text = dataSet.Tables[1].Rows[0]["CanNang"].ToString();
		}
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		LoadDanhSachDonHang();
	}
}
