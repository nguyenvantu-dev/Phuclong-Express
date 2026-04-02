using System;
using System.Data;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class ThongTinShipHang : Page
{
	protected Label lbNgayGui;

	protected Label lbShipperName;

	protected Label lbShipperPhone;

	protected Label lbShipperAddress;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && int.TryParse(Page.Request.QueryString["id"], out var result))
		{
			LoadThongTinShipHang(result);
		}
	}

	private void LoadThongTinShipHang(int ID)
	{
		DBConnect dBConnect = new DBConnect();
		DataSet dataSet = dBConnect.LayThongTinShipByID(ID);
		if (dataSet != null && dataSet.Tables.Count > 0 && dataSet.Tables[0].Rows.Count > 0)
		{
			DataRow dataRow = dataSet.Tables[0].Rows[0];
			lbNgayGui.Text = ((dataRow["NgayGuiHang"] == DBNull.Value) ? "" : ((DateTime)dataRow["NgayGuiHang"]).ToString("dd/MM/yyyy"));
			lbShipperName.Text = ((dataRow["ShipperName"] == DBNull.Value) ? "" : dataRow["ShipperName"].ToString());
			lbShipperPhone.Text = ((dataRow["ShipperPhone"] == DBNull.Value) ? "" : dataRow["ShipperPhone"].ToString());
			lbShipperAddress.Text = ((dataRow["ShipperAddress"] == DBNull.Value) ? "" : dataRow["ShipperAddress"].ToString());
		}
	}
}
