using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class EditOrder1 : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected CheckBoxList cblTrangThaiOrder;

	protected TextBox tbNoiDungTim;

	protected TextBox tbMaDatHang;

	protected DropDownList ddQuocGia;

	protected DropDownList ddUserName;

	protected Button btTimKiem;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected Button btExportToExcel1Page;

	protected Button btExportToExcelAllWithFilter;

	protected LinkButton lbtCapNhatNgayVe;

	protected LinkButton lbtMassCancel;

	protected LinkButton lbtMassComplete;

	protected LinkButton lbtMassReceived;

	protected LinkButton lbtMassShipped;

	protected LinkButton lbtBoSungGhiChu;

	protected GridView gvDonHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadSoLuongDonHang();
			LoadDataQuocGia();
			if (base.User.IsInRole("Admin") || base.User.IsInRole("Order"))
			{
				lbtCapNhatNgayVe.Visible = true;
				lbtMassCancel.Visible = true;
				lbtMassComplete.Visible = true;
				lbtMassReceived.Visible = true;
				lbtMassShipped.Visible = true;
			}
			else if (base.User.IsInRole("Kho"))
			{
				lbtMassCancel.Visible = false;
				lbtMassReceived.Visible = false;
				lbtMassShipped.Visible = false;
			}
			else if (base.User.IsInRole("Sale"))
			{
				lbtCapNhatNgayVe.Visible = false;
				lbtMassCancel.Visible = false;
				lbtMassComplete.Visible = false;
				lbtMassReceived.Visible = false;
				lbtMassShipped.Visible = false;
			}
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
		DonHangPhanTrang donHangPhanTrang = bLL.LayDanhSachDonHang("", ddUserName.SelectedValue, text, tbNoiDungTim.Text.Trim(), -1, tbMaDatHang.Text, "", -1, Convert.ToInt32(ddQuocGia.SelectedValue), DaXoa: false, tuNgay, denNgay, pageSize, pageNum);
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

	private void LoadSoLuongDonHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LaySoLuongDonHang("", -1);
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
		LoadDanhSachDonHang();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachDonHang();
	}

	protected void btExportToExcel1Page_Click(object sender, EventArgs e)
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

	public override void VerifyRenderingInServerForm(Control control)
	{
	}

	protected void btExportToExcelAllWithFilter_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		ExcelUtils excelUtils = new ExcelUtils();
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
		DataSet dataSet = null;
		dataSet = dBConnect.LayDanhSachDonHang("", ddUserName.SelectedValue, text, tbNoiDungTim.Text.Trim(), -1, tbMaDatHang.Text, "", -1, Convert.ToInt32(ddQuocGia.SelectedValue), DaXoa: false, tuNgay, denNgay, 100000, 1);
		int num = 0;
		DataTable dataTable = new DataTable();
		if (dataSet != null && dataSet.Tables.Count > 0)
		{
			num = Convert.ToInt32(dataSet.Tables[0].Rows[0][0]);
			DataView dataView = new DataView(dataSet.Tables[1]);
			dataTable = dataView.ToTable(false, "ID", "ngaymuahang", "ordernumber", "username", "linkweb", "linkhinh", "corlor", "size", "soluong", "phuthu", "saleoff", "shipUSA", "tax", "dongiaweb", "cong", "tiencongUSD", "tongtienUSD", "tygia", "tongtienVND", "trangthaiOrder", "ngayveVN", "TenDotHang", "ghichu");
		}
		base.Response.ClearContent();
		base.Response.Clear();
		base.Response.ContentType = "application/vnd.xls";
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.AppendHeader("Content-Disposition", string.Format("attachment; filename=DanhSachDonHang_{0}.xls", DateTime.Now.ToString("yyyyMMdd_HHmm")));
		base.Response.Charset = Encoding.UTF8.WebName;
		base.Response.HeaderEncoding = Encoding.UTF8;
		base.Response.ContentEncoding = Encoding.UTF8;
		base.Response.BinaryWrite(Encoding.UTF8.GetPreamble());
		StringBuilder stringBuilder = new StringBuilder();
		for (int i = 0; i < dataTable.Columns.Count; i++)
		{
			stringBuilder.Append(dataTable.Columns[i].ColumnName + ",");
		}
		stringBuilder.Append("\r\n");
		for (int j = 0; j < dataTable.Rows.Count; j++)
		{
			for (int k = 0; k < dataTable.Columns.Count; k++)
			{
				stringBuilder.Append(dataTable.Rows[j][k].ToString().Replace(",", ";") + ",");
			}
			stringBuilder.Append("\r\n");
		}
		base.Response.Output.Write(stringBuilder.ToString());
		base.Response.Flush();
		base.Response.End();
	}

	public void CreateCSVFile(ref DataTable dt, string strFilePath)
	{
		try
		{
			StreamWriter streamWriter = new StreamWriter(strFilePath, append: false);
			int count = dt.Columns.Count;
			for (int i = 0; i < count; i++)
			{
				streamWriter.Write(dt.Columns[i]);
				if (i < count - 1)
				{
					streamWriter.Write(",");
				}
			}
			streamWriter.Write(streamWriter.NewLine);
			foreach (DataRow row in dt.Rows)
			{
				for (int j = 0; j < count; j++)
				{
					if (!Convert.IsDBNull(row[j]))
					{
						streamWriter.Write(row[j].ToString());
					}
					if (j < count - 1)
					{
						streamWriter.Write(",");
					}
				}
				streamWriter.Write(streamWriter.NewLine);
			}
			streamWriter.Close();
		}
		catch (Exception ex)
		{
			throw ex;
		}
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
		DBConnect dBConnect = new DBConnect();
		string text = "";
		if (dBConnect.KiemTraDuocCapNhatCongNo(DateTime.Now, "") != 0)
		{
			base.Response.Write("<script>alert('Kỳ đã đóng không thể thực hiện cancel');</script>");
			return;
		}
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			dBConnect.MassCancel1(text, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder:MassCancel1", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachDonHang();
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
			LoadDanhSachDonHang();
		}
	}

	protected void lbtMassReceived_Click(object sender, EventArgs e)
	{
		DBConnect dBConnect = new DBConnect();
		string text = "";
		if (dBConnect.KiemTraDuocCapNhatCongNo(DateTime.Now, "") != 0)
		{
			base.Response.Write("<script>alert('Kỳ đã đóng không thể thực hiện cancel');</script>");
			return;
		}
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			dBConnect.MassReceived(text, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrder:MassReceived", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachDonHang();
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
			LoadDanhSachDonHang();
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
				LoadDanhSachDonHang();
			}
		}
		catch
		{
		}
	}

	protected void lbtBoSungGhiChu_Click(object sender, EventArgs e)
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
			Page.Response.Redirect("/admin/EditOrder_BoSungGhiChu.aspx?id=" + text);
		}
	}
}
