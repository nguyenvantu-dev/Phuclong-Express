using System;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class CauHinh : Page
{
	protected Label lbLoi;

	protected TextBox tbPhiShipHang;

	protected TextBox tbThue;

	protected Button btLuu;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadCauHinh();
		}
	}

	private void LoadCauHinh()
	{
		try
		{
			DBCauHinh dBCauHinh = new DBCauHinh();
			tbPhiShipHang.Text = dBCauHinh.PhiShipHang;
			tbThue.Text = dBCauHinh.Thue.ToString();
		}
		catch
		{
		}
	}

	protected void btLuu_Click(object sender, EventArgs e)
	{
		DBCauHinh dBCauHinh = new DBCauHinh();
		dBCauHinh.PhiShipHang = tbPhiShipHang.Text.Trim();
		if (!string.IsNullOrEmpty(tbThue.Text.Trim()))
		{
			dBCauHinh.Thue = Convert.ToDouble(tbThue.Text.Trim());
		}
	}
}
