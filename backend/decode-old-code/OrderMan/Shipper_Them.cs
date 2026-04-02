using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class Shipper_Them : Page
{
	protected Label lbLoi;

	protected TextBox tbShipperName;

	protected TextBox tbShipperPhone;

	protected TextBox tbShipperAddress;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack && int.TryParse(Page.Request.QueryString["id"], out var _))
		{
			LoadDataShipper();
		}
	}

	private void LoadDataShipper()
	{
		BLL bLL = new BLL();
		Shipper shipper = bLL.LayShipperByID(Convert.ToInt32(Page.Request.QueryString["id"]));
		tbShipperName.Text = shipper.ShipperName;
		tbShipperPhone.Text = shipper.ShipperPhone;
		tbShipperAddress.Text = shipper.ShipperAddress;
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		try
		{
			if (string.IsNullOrEmpty(tbShipperName.Text.Trim()) || string.IsNullOrEmpty(tbShipperPhone.Text.Trim()))
			{
				lbLoi.Text = "Vui lòng nhập đủ thông tin";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			if (string.IsNullOrEmpty(Page.Request.QueryString["id"]))
			{
				dBConnect.ThemShipper(tbShipperName.Text.Trim(), tbShipperPhone.Text.Trim(), tbShipperAddress.Text.Trim());
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Shipper_Them:ThemShipper", StringEnum.GetStringValue(HanhDong.ThemMoi), "", "ShipperName: " + tbShipperName.Text.Trim() + "; ShipperPhone: " + tbShipperPhone.Text.Trim() + "; ShipperAddress: " + tbShipperAddress.Text.Trim());
			}
			else
			{
				dBConnect.CapNhatShipper(Convert.ToInt32(Page.Request.QueryString["id"]), tbShipperName.Text.Trim(), tbShipperPhone.Text.Trim(), tbShipperAddress.Text.Trim());
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Shipper_Them:CapNhatShipper", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID" + Page.Request.QueryString["id"] + "; ShipperName: " + tbShipperName.Text.Trim() + "; ShipperPhone: " + tbShipperPhone.Text.Trim() + "; ShipperAddress: " + tbShipperAddress.Text.Trim());
			}
			Page.Response.Redirect("/admin/Shipper_LietKe.aspx");
		}
		catch (Exception)
		{
		}
	}
}
