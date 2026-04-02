using System;
using System.Data;
using System.IO;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class DanhSachTracking : Page
{
	private int pageNum = 1;

	private int pageSize = 20;

	protected TextBox tbNoiDungTim;

	protected CheckBoxList cblTinhTrang;

	protected Button btTimKiem;

	protected Button btExportToExcel;

	protected Repeater rptTracking;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadSoLuongTracking();
		}
	}

	private void LoadSoLuongTracking()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LaySoLuongTracking(base.User.Identity.GetUserName());
			if (dataSet == null || dataSet.Tables.Count <= 0 || dataSet.Tables[0].Rows.Count <= 0)
			{
				return;
			}
			foreach (DataRow row in dataSet.Tables[0].Rows)
			{
				switch (row["TinhTrang"].ToString())
				{
				case "Received":
					cblTinhTrang.Items[0].Text = "Received (" + row["SL"].ToString() + ")";
					break;
				case "InTransit":
					cblTinhTrang.Items[1].Text = "InTransit (" + row["SL"].ToString() + ")";
					break;
				case "InVN":
					cblTinhTrang.Items[2].Text = "InVN (" + row["SL"].ToString() + ")";
					break;
				case "VNTransit":
					cblTinhTrang.Items[3].Text = "VNTransit (" + row["SL"].ToString() + ")";
					break;
				case "Completed":
					cblTinhTrang.Items[4].Text = "Completed (" + row["SL"].ToString() + ")";
					break;
				case "Cancelled":
					cblTinhTrang.Items[5].Text = "Cancelled (" + row["SL"].ToString() + ")";
					break;
				}
			}
		}
		catch
		{
		}
	}

	private void LoadDanhSachTracking()
	{
		string text = "";
		foreach (ListItem item in cblTinhTrang.Items)
		{
			if (item.Selected)
			{
				text = (string.IsNullOrEmpty(text) ? ("'" + item.Value + "'") : (text + ",'" + item.Value + "'"));
			}
		}
		BLL bLL = new BLL();
		TrackingPhanTrang trackingPhanTrang = bLL.LayDanhSachTracking(base.User.Identity.GetUserName(), text, tbNoiDungTim.Text.Trim(), -1, "", "", -1, DaXoa: false, "", "", pageSize, pageNum);
		rptTracking.DataSource = trackingPhanTrang.DanhSachTracking;
		rptTracking.DataBind();
		myPager.BuildPaging(pageNum, trackingPhanTrang.TotalItem, pageSize);
	}

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		LoadDanhSachTracking();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachTracking();
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
		rptTracking.RenderControl(writer);
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
				if (dBConnect.XoaTracking(Convert.ToInt32(linkButton.CommandArgument)))
				{
					dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "DanhSachTracking:XoaTracking", StringEnum.GetStringValue(HanhDong.Xoa), linkButton.CommandArgument, "ID: " + linkButton.CommandArgument);
					LoadDanhSachTracking();
				}
			}
		}
		catch
		{
		}
	}
}
