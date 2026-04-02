using System;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class ShipperDetail : Page
{
	protected Label lbShipperName;

	protected Label lbShipperPhone;

	protected Label lbShipperAddress;

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
		lbShipperName.Text = shipper.ShipperName;
		lbShipperPhone.Text = shipper.ShipperPhone;
		lbShipperAddress.Text = shipper.ShipperAddress;
	}
}
