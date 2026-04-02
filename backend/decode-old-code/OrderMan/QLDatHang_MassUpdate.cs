using System;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class QLDatHang_MassUpdate : Page
{
	protected Label lbLoi;

	protected TextBox tbOrderNumber;

	protected TextBox tbTyGia;

	protected TextBox tbCong;

	protected TextBox tbSaleOff;

	protected TextBox tbTax;

	protected TextBox tbTotalCharged;

	protected TextBox tbTotalItem;

	protected Button btShare;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			string text = Page.Request.QueryString["id"];
			string text2 = Page.Request.QueryString["ws"];
			if (string.IsNullOrEmpty(text))
			{
				Page.Response.Redirect("/admin/QLDatHang_LietKe.aspx");
				return;
			}
			lbLoi.Text = "Đang xử lý những ID của Website " + text2 + " " + text;
			LoadTyGia(text);
		}
	}

	protected void LoadTyGia(string id)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			tbTyGia.Text = dBConnect.LayTyGiaHienTaiTuDanhSachDonHang(id);
		}
		catch
		{
		}
	}

	protected void btShare_Click(object sender, EventArgs e)
	{
		double phuthu = 0.0;
		double shipUSA = 0.0;
		if (string.IsNullOrEmpty(tbOrderNumber.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập Order number";
			return;
		}
		if (string.IsNullOrEmpty(tbTyGia.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập tỷ giá";
			return;
		}
		if (!double.TryParse(tbTyGia.Text.Trim(), out var result))
		{
			lbLoi.Text = "Tỷ giá phải là kiểu số";
			return;
		}
		double result2;
		if (string.IsNullOrEmpty(tbSaleOff.Text.Trim()))
		{
			result2 = 0.0;
		}
		else if (!double.TryParse(tbSaleOff.Text.Trim(), out result2))
		{
			lbLoi.Text = "Sale off(%) phải là kiểu số";
			return;
		}
		double result3;
		if (string.IsNullOrEmpty(tbCong.Text.Trim()))
		{
			result3 = 0.0;
		}
		else if (!double.TryParse(tbCong.Text.Trim(), out result3))
		{
			lbLoi.Text = "Công phải là kiểu số";
			return;
		}
		double result4;
		if (string.IsNullOrEmpty(tbTax.Text.Trim()))
		{
			result4 = 0.0;
		}
		else if (!double.TryParse(tbTax.Text.Trim(), out result4))
		{
			lbLoi.Text = "Tax phải là kiểu số";
			return;
		}
		double result5;
		if (string.IsNullOrEmpty(tbTotalCharged.Text.Trim()))
		{
			result5 = 0.0;
		}
		else if (!double.TryParse(tbTotalCharged.Text.Trim(), out result5))
		{
			lbLoi.Text = "Total charged phải là kiểu số";
			return;
		}
		if (string.IsNullOrEmpty(tbTotalItem.Text.Trim()))
		{
			lbLoi.Text = "Phải nhập Total item";
			return;
		}
		if (!int.TryParse(tbTotalItem.Text.Trim(), out var result6))
		{
			lbLoi.Text = "Total item phải là kiểu số";
			return;
		}
		DBConnect dBConnect = new DBConnect();
		if (dBConnect.ShareOrders(Page.Request.QueryString["id"], tbOrderNumber.Text.Trim(), result3, result2, phuthu, shipUSA, result4, result5, result6, HeThongTuTinhCong: false, result, base.User.Identity.GetUserName()))
		{
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "QLDatHang_MassUpdate:ShareOrders", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "OrderNumber: " + tbOrderNumber.Text.Trim() + "; cong: 0; SaleOff: " + result2 + "; PhuThu: " + phuthu + "; ShipUSA: " + shipUSA + "; Tax: " + result4 + "; " + Environment.NewLine + "TotalCharged: " + result5 + "; TotalItem: " + result6 + "; TyGia: " + result);
			Page.Response.Redirect("/admin/QLDatHang_LietKe.aspx");
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác";
		}
	}
}
