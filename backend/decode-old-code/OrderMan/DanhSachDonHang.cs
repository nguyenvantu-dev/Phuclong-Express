using System;
using System.Data;
using System.IO;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DanhSachDonHang : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected TextBox tbNoiDungTim;

	protected CheckBoxList cblTrangThaiOrder;

	protected Button btTimKiem;

	protected Button btExportToExcel;

	protected Repeater rptDonHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadSoLuongDonHang();
		}
	}

	private void LoadSoLuongDonHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LaySoLuongDonHang(base.User.Identity.GetUserName(), -1);
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

	private void LoadDanhSachDonHang()
	{
		string text = "";
		foreach (ListItem item in cblTrangThaiOrder.Items)
		{
			if (item.Selected)
			{
				text = (string.IsNullOrEmpty(text) ? ("'" + item.Value + "'") : (text + ",'" + item.Value + "'"));
			}
		}
		BLL bLL = new BLL();
		DonHangPhanTrang donHangPhanTrang = bLL.LayDanhSachDonHang("", base.User.Identity.GetUserName(), text, tbNoiDungTim.Text.Trim(), -1, "", "", -1, -1, DaXoa: false, "", "", pageSize, pageNum);
		rptDonHang.DataSource = donHangPhanTrang.DanhSachDonHang;
		rptDonHang.DataBind();
		myPager.BuildPaging(pageNum, donHangPhanTrang.TotalItem, pageSize);
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachDonHang();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachDonHang();
	}

	protected void ExportToExcel()
	{
		base.Response.Clear();
		base.Response.Buffer = true;
		base.Response.AddHeader("content-disposition", "attachment;filename=DanhSachDatHang.xls");
		base.Response.Charset = "";
		base.Response.ContentType = "application/vnd.ms-excel";
		StringWriter stringWriter = new StringWriter();
		HtmlTextWriter writer = new HtmlTextWriter(stringWriter);
		rptDonHang.RenderControl(writer);
		string input = Regex.Replace(stringWriter.ToString(), "(<img \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<input class=\"checkbox\"\\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		input = Regex.Replace(input, "(<a \\/?[^>]+>)", "", RegexOptions.IgnoreCase);
		base.Response.Write(input.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	protected void btExportToExcel_Click(object sender, EventArgs e)
	{
		ExportToExcel();
	}

	protected void lbtDelete_Click(object sender, EventArgs e)
	{
		try
		{
			LinkButton linkButton = (LinkButton)sender;
			string commandName = linkButton.CommandName;
			string text = commandName;
			if (text == "Delete")
			{
				DBConnect dBConnect = new DBConnect();
				if (dBConnect.XoaDonHang(Convert.ToInt32(linkButton.CommandArgument), base.User.Identity.GetUserName()))
				{
					dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhSachDonHang:XoaDonHang", StringEnum.GetStringValue(HanhDong.Xoa), "", "ID: " + linkButton.CommandArgument);
				}
				LoadDanhSachDonHang();
			}
		}
		catch
		{
		}
	}

	public override void VerifyRenderingInServerForm(Control control)
	{
	}
}
