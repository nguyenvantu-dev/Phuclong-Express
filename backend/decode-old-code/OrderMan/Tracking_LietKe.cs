using System;
using System.Data;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class Tracking_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected CheckBoxList cblTinhTrang;

	protected TextBox tbNoiDungTim;

	protected TextBox tbTracking;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected DropDownList ddQuocGia;

	protected DropDownList ddUserName;

	protected Button btTimKiem;

	protected LinkButton lbtMassLoHang;

	protected LinkButton lbtMassReceived;

	protected LinkButton lbtMassInTransit;

	protected LinkButton lbtMassInVN;

	protected LinkButton lbtMassVNTransit;

	protected LinkButton lbtMassComplete;

	protected LinkButton lbtMassDelete;

	protected LinkButton lbtMassCancel;

	protected LinkButton lbtCompleteAllWithFilter;

	protected GridView gvTracking;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadSoLuongTracking();
			LoadDataQuocGia();
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
		TrackingPhanTrang trackingPhanTrang = bLL.LayDanhSachTracking(ddUserName.SelectedValue, text, tbNoiDungTim.Text.Trim(), -1, tbTracking.Text, "", Convert.ToInt32(ddQuocGia.SelectedValue), DaXoa: false, tuNgay, denNgay, pageSize, pageNum);
		gvTracking.DataSource = trackingPhanTrang.DanhSachTracking;
		gvTracking.DataBind();
		myPager.BuildPaging(pageNum, trackingPhanTrang.TotalItem, pageSize);
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
			ddUserName.Items.Insert(0, new ListItem("--Tất cả User--", ""));
		}
		catch
		{
		}
	}

	private void LoadSoLuongTracking()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LaySoLuongTracking("");
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

	private void LoadDataQuocGia()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddQuocGia.DataSource = dBConnect.LayDanhSachQuocGia();
			ddQuocGia.DataBind();
			ddQuocGia.Items.Insert(0, new ListItem("--Tất cả Quốc gia--", "-1"));
		}
		catch
		{
		}
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

	protected void lbtMassDelete_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassDeleteTracking(text);
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassDelete", StringEnum.GetStringValue(HanhDong.Xoa), "", "ID: " + text);
			LoadDanhSachTracking();
		}
	}

	protected void lbtMassCancel_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassStatusTracking(text, StringEnum.GetStringValue(TinhTrangTracking.Cancelled), null, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassCancel", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachTracking();
		}
	}

	protected void lbtMassLoHang_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			Page.Response.Redirect("/admin/Tracking_NgayLoHang.aspx?id=" + text);
		}
	}

	protected void lbtMassComplete_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassStatusTracking(text, StringEnum.GetStringValue(TinhTrangTracking.Completed), null, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassComplete", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachTracking();
		}
	}

	protected void lbtMassReceived_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassStatusTracking(text, StringEnum.GetStringValue(TinhTrangTracking.Received), null, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassReceived", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachTracking();
		}
	}

	protected void lbtMassInTransit_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassStatusTracking(text, StringEnum.GetStringValue(TinhTrangTracking.InTransit), null, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassInTransit", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachTracking();
		}
	}

	protected void lbtMassInVN_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassStatusTracking(text, StringEnum.GetStringValue(TinhTrangTracking.InVN), null, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassInVN", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachTracking();
		}
	}

	protected void lbtMassVNTransit_Click(object sender, EventArgs e)
	{
		string text = "";
		for (int i = 0; i < gvTracking.Rows.Count; i++)
		{
			if (((CheckBox)gvTracking.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvTracking.DataKeys[i]["TrackingID"].ToString()) : gvTracking.DataKeys[i]["TrackingID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			DBConnect dBConnect = new DBConnect();
			dBConnect.MassStatusTracking(text, StringEnum.GetStringValue(TinhTrangTracking.VNTransit), null, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassVNTransit", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachTracking();
		}
	}

	protected void lbtCompleteAllWithFilter_Click(object sender, EventArgs e)
	{
		string text = "";
		foreach (ListItem item in cblTinhTrang.Items)
		{
			if (item.Selected)
			{
				text = (string.IsNullOrEmpty(text) ? ("'" + item.Value + "'") : (text + ",'" + item.Value + "'"));
			}
		}
		string text2 = "";
		string text3 = "";
		try
		{
			if (!string.IsNullOrEmpty(tbTuNgay.Text))
			{
				text2 = DateTimeUtil.getSqlDatetime(tbTuNgay.Text);
			}
		}
		catch
		{
		}
		try
		{
			if (!string.IsNullOrEmpty(tbDenNgay.Text))
			{
				text3 = DateTimeUtil.getSqlDatetime(tbDenNgay.Text);
			}
		}
		catch
		{
		}
		DBConnect dBConnect = new DBConnect();
		dBConnect.MassStatusAllTrackingWithFilter(ddUserName.SelectedValue, text, tbNoiDungTim.Text.Trim(), -1, tbTracking.Text, "", Convert.ToInt32(ddQuocGia.SelectedValue), DaXoa: false, text2, text3, StringEnum.GetStringValue(TinhTrangTracking.Completed), null, base.User.Identity.GetUserName());
		dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "Tracking_LietKe:MassCompleteAllWithFilter", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "UserName: " + ddUserName.SelectedValue + "; TinhTrangFilter: " + text + "; NoiDungTim: " + tbNoiDungTim.Text.Trim() + "; Tracking number: " + tbTracking.Text + "; QuocGiaID: " + ddQuocGia.SelectedValue + "; Từ ngày: " + text2 + "; Đến ngày: " + text3 + "; NguoiTao: " + text);
		LoadDanhSachTracking();
	}
}
