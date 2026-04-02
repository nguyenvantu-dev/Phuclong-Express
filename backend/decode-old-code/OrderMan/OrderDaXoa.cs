using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class OrderDaXoa : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected CheckBoxList cblTrangThaiOrder;

	protected TextBox tbNoiDungTim;

	protected TextBox tbMaDatHang;

	protected DropDownList ddQuocGia;

	protected DropDownList ddUserName;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected Button btTimKiem;

	protected Button btExportToExcel;

	protected GridView gvDonHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadSoLuongDonHangDaXoa();
			LoadDataQuocGia();
		}
	}

	private void LoadDanhSachDonHangDaXoa()
	{
		string text = "";
		foreach (ListItem item in cblTrangThaiOrder.Items)
		{
			if (item.Selected)
			{
				text = (string.IsNullOrEmpty(text) ? ("'" + item.Value + "'") : (text + ",'" + item.Value + "'"));
			}
		}
		string tuNgay = "";
		string denNgay = "";
		try
		{
			if (!string.IsNullOrEmpty(tbTuNgay.Text))
			{
				tuNgay = DateTimeUtil.getSqlDatetime(tbTuNgay.Text);
			}
		}
		catch
		{
		}
		try
		{
			if (!string.IsNullOrEmpty(tbDenNgay.Text))
			{
				denNgay = DateTimeUtil.getSqlDatetime(tbDenNgay.Text);
			}
		}
		catch
		{
		}
		BLL bLL = new BLL();
		DonHangPhanTrang donHangPhanTrang = bLL.LayDanhSachDonHang("", ddUserName.SelectedValue, text, tbNoiDungTim.Text.Trim(), -1, tbMaDatHang.Text, "", -1, Convert.ToInt32(ddQuocGia.SelectedValue), DaXoa: true, tuNgay, denNgay, pageSize, pageNum);
		gvDonHang.DataSource = donHangPhanTrang.DanhSachDonHang;
		gvDonHang.DataBind();
		myPager.BuildPaging(pageNum, donHangPhanTrang.TotalItem, pageSize);
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
			ddUserName.Items.Insert(0, new ListItem("--All--", ""));
		}
		catch
		{
		}
	}

	private void LoadSoLuongDonHangDaXoa()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LaySoLuongDonHangDaXoa("", -1);
			if (dataSet == null || dataSet.Tables.Count <= 0 || dataSet.Tables[0].Rows.Count <= 0)
			{
				return;
			}
			foreach (DataRow row in dataSet.Tables[0].Rows)
			{
				switch (row["trangthaiOrder"].ToString())
				{
				case "Received":
					cblTrangThaiOrder.Items[0].Text = "Received (" + row["SL"].ToString() + ")";
					break;
				case "Ordered":
					cblTrangThaiOrder.Items[1].Text = "Ordered (" + row["SL"].ToString() + ")";
					break;
				case "Shipped":
					cblTrangThaiOrder.Items[2].Text = "Shipped (" + row["SL"].ToString() + ")";
					break;
				case "Completed":
					cblTrangThaiOrder.Items[3].Text = "Completed (" + row["SL"].ToString() + ")";
					break;
				case "Cancelled":
					cblTrangThaiOrder.Items[4].Text = "Cancelled (" + row["SL"].ToString() + ")";
					break;
				}
			}
		}
		catch
		{
		}
	}

	private void LoadDataQuocGia()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddQuocGia.DataSource = dBConnect.LayDanhSachQuocGia();
			ddQuocGia.DataBind();
			ddQuocGia.Items.Insert(0, new ListItem("--All--", "-1"));
		}
		catch
		{
		}
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachDonHangDaXoa();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachDonHangDaXoa();
	}

	protected void ExportToExcel()
	{
		base.Response.Clear();
		base.Response.Buffer = true;
		base.Response.AddHeader("content-disposition", "attachment;filename=DanhSachDatHang.xls");
		base.Response.Charset = "";
		base.Response.ContentType = "application/vnd.xlsx";
		StringWriter stringWriter = new StringWriter();
		HtmlTextWriter writer = new HtmlTextWriter(stringWriter);
		gvDonHang.RenderControl(writer);
		string input = Regex.Replace(stringWriter.ToString(), "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<input type=\"checkbox\"\\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<a \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		base.Response.Write(input.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	protected void btExportToExcel_Click(object sender, EventArgs e)
	{
		ExportToExcel();
	}

	public override void VerifyRenderingInServerForm(Control control)
	{
	}

	protected void lbtCapNhatNgayVe_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			Page.Response.Redirect("/admin/EditOrder_NgayVeVN.aspx?id=" + text);
		}
	}

	protected void lbtMassCancel_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassCancel1(text, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder:MassCancel1", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachDonHangDaXoa();
		}
	}

	protected void lbtMassComplete_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				string text2 = gvDonHang.DataKeys[i]["trangthaiOrder"].ToString();
				if (!(text2 == "Ordered") && !(text2 == "Shipped"))
				{
					base.Response.Write("<script>alert('Có đơn hàng không thể complete - chỉ có thể complete đơn hàng đã Ordered hoặc Shipped');</script>");
					return;
				}
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassComplete(text);
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder:MassComplete", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachDonHangDaXoa();
		}
	}

	protected void lbtMassReceived_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassReceived(text, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder:MassReceived", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachDonHangDaXoa();
		}
	}

	protected void lbtMassShipped_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassShipped(text);
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder:MassShipped", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachDonHangDaXoa();
		}
	}

	protected void lbtCapNhatTrackingNumber_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			Page.Response.Redirect("/admin/EditOrder_TrackingNumber.aspx?id=" + text);
		}
	}

	protected void gvDonHang_RowDeleting(object sender, GridViewDeleteEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvDonHang.DataKeys[e.RowIndex]["ID"]);
			DBConnect dBConnect = new DBConnect();
			if (dBConnect.XoaDonHang(iD, base.User.Identity.GetUserName()))
			{
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder:XoaDonHang", StringEnum.GetStringValue(HanhDong.Xoa), "", "ID: " + iD);
				LoadDanhSachDonHangDaXoa();
			}
		}
		catch
		{
		}
	}
}
