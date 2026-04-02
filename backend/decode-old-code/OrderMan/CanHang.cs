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

public class CanHang : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected CheckBoxList cblTrangThaiOrder;

	protected TextBox tbNoiDungTim;

	protected TextBox tbMaDatHang;

	protected DropDownList ddUserName;

	protected DropDownList ddDotHang;

	protected Button btTimKiem;

	protected Button btExportToExcel;

	protected Label lbLoi;

	protected LinkButton lbtCapNhatNgayVe;

	protected LinkButton lbtMassComplete;

	protected LinkButton lbtMassShipped;

	protected GridView gvDonHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadDataUser();
			LoadSoLuongDonHang();
			LoadDataDotHang();
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
		DonHangPhanTrang donHangPhanTrang = bLL.LayDanhSachDonHang("", ddUserName.SelectedValue, text, tbNoiDungTim.Text.Trim(), -1, tbMaDatHang.Text, ddDotHang.SelectedValue, 0, -1, DaXoa: false, "", "", pageSize, pageNum);
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
			DataSet dataSet = dBConnect.LaySoLuongDonHang("", 0);
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

	private void LoadDataLoaiHang(DropDownList ddgvLoaiHang, string Selecteditemvalue)
	{
		try
		{
			BLL bLL = new BLL();
			ddgvLoaiHang.DataSource = bLL.LayDanhSachLoaiHang();
			ddgvLoaiHang.DataBind();
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvLoaiHang.ClearSelection();
				ListItem listItem = ddgvLoaiHang.Items.FindByValue(Selecteditemvalue);
				if (listItem != null)
				{
					listItem.Selected = true;
				}
			}
		}
		catch
		{
		}
	}

	private void LoadDataDotHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddDotHang.DataSource = dBConnect.LayDanhSachTenDotHang(DateTime.Today.AddYears(-1));
			ddDotHang.DataBind();
			ddDotHang.Items.Insert(0, new ListItem("--All--", ""));
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
			Page.Response.Redirect("/admin/EditOrder_NgayVeVN.aspx?rt=ch&id=" + text);
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
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CanHang:MassComplete", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
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
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CanHang:MassShipped", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + text);
			LoadDanhSachDonHang();
		}
	}

	protected void gvDonHang_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvDonHang.EditIndex = -1;
		LoadDanhSachDonHang();
	}

	protected void gvDonHang_RowEditing(object sender, GridViewEditEventArgs e)
	{
		try
		{
			gvDonHang.EditIndex = e.NewEditIndex;
			LoadDanhSachDonHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvDonHang_RowUpdating(object sender, GridViewUpdateEventArgs e)
	{
		try
		{
			int iD = Convert.ToInt32(gvDonHang.DataKeys[e.RowIndex]["ID"]);
			TextBox textBox = gvDonHang.Rows[e.RowIndex].FindControl("tbgvCanNang") as TextBox;
			DropDownList dropDownList = gvDonHang.Rows[e.RowIndex].FindControl("ddgvLoaiHang") as DropDownList;
			TextBox textBox2 = gvDonHang.Rows[e.RowIndex].FindControl("tbgvCanHang_TienShipVeVN") as TextBox;
			TextBox textBox3 = gvDonHang.Rows[e.RowIndex].FindControl("tbgvCanHang_GhiChuShipVeVN") as TextBox;
			double result;
			if (string.IsNullOrEmpty(textBox.Text.Trim()))
			{
				result = 0.0;
			}
			else if (!double.TryParse(textBox.Text.Trim(), out result))
			{
				lbLoi.Text = "Cân nặng phải là kiểu số";
				return;
			}
			double result2;
			if (string.IsNullOrEmpty(textBox2.Text.Trim()))
			{
				result2 = 0.0;
			}
			else if (!double.TryParse(textBox2.Text.Trim(), out result2))
			{
				lbLoi.Text = "Phí ship về VN phải là kiểu số";
				return;
			}
			DBConnect dBConnect = new DBConnect();
			dBConnect.CanHang(iD, Convert.ToInt32(dropDownList.SelectedValue), result, result2, 0.0, textBox3.Text.Trim(), base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "CanHang:CanHang", StringEnum.GetStringValue(HanhDong.ChinhSua), iD.ToString(), "ID: " + iD + "; LoaiHang: " + dropDownList.SelectedValue + "; CanHang_SoKg: " + result + "; CanHang_TienShipVeVN: " + result2 + "; CanHang_GhiChuShipVeVN: " + textBox3.Text.Trim());
			gvDonHang.EditIndex = -1;
			LoadDanhSachDonHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvDonHang_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		try
		{
			if (e.CommandName == "TinhTienShip")
			{
				int index = int.Parse(e.CommandArgument.ToString());
				GridViewRow gridViewRow = (GridViewRow)((Control)e.CommandSource).NamingContainer;
				TextBox textBox = gridViewRow.FindControl("tbgvCanNang") as TextBox;
				DropDownList dropDownList = gridViewRow.FindControl("ddgvLoaiHang") as DropDownList;
				TextBox textBox2 = gridViewRow.FindControl("tbgvCanHang_TienShipVeVN") as TextBox;
				string loaiTien = (string)gvDonHang.DataKeys[index]["loaitien"];
				string userName = (string)gvDonHang.DataKeys[index]["username"];
				double result;
				if (string.IsNullOrEmpty(textBox.Text.Trim()))
				{
					result = 0.0;
				}
				else if (!double.TryParse(textBox.Text.Trim(), out result))
				{
					lbLoi.Text = "Cân nặng phải là kiểu số";
					return;
				}
				DBConnect dBConnect = new DBConnect();
				textBox2.Text = EnhancedMath.RoundUp(result * (double)dBConnect.LayCongShipVeVN(Convert.ToInt32(dropDownList.SelectedValue), loaiTien, userName), 0).ToString("N0");
			}
		}
		catch
		{
		}
	}

	protected void gvDonHang_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && (e.Row.RowState & DataControlRowState.Edit) == DataControlRowState.Edit)
		{
			DonHang donHang = (DonHang)e.Row.DataItem;
			DropDownList ddgvLoaiHang = (DropDownList)e.Row.FindControl("ddgvLoaiHang");
			LoadDataLoaiHang(ddgvLoaiHang, donHang.LoaiHangID.HasValue ? donHang.LoaiHangID.ToString() : "");
		}
	}
}
