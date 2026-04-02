using System;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class QLDatHang_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 2000;

	protected TextBox tbNoiDungTim;

	protected TextBox tbMaDatHang;

	protected TextBox tbTuNgay;

	protected TextBox tbDenNgay;

	protected DropDownList ddWebsite;

	protected DropDownList ddQuocGia;

	protected DropDownList ddUserName;

	protected Button btTimKiem;

	protected Label lblTotalCount;

	protected Label lblTotalPrice;

	protected Label lblTotalVND;

	protected LinkButton lbtMassUpdate;

	protected LinkButton lbtMassDelete;

	protected LinkButton lbtMassCancel;

	protected GridView gvDonHang;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataWebsiteReceived();
			LoadDataUserReceived();
			LoadDataQuocGia();
			if (base.User.IsInRole("Admin"))
			{
				lbtMassDelete.Visible = true;
			}
		}
	}

	private void LoadDanhSachDonHang()
	{
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
		DonHangPhanTrang donHangPhanTrang = bLL.LayDanhSachDonHang(ddWebsite.SelectedValue, ddUserName.SelectedValue, "'Received'", tbNoiDungTim.Text, -1, tbMaDatHang.Text, "", 0, Convert.ToInt32(ddQuocGia.SelectedValue), DaXoa: false, tuNgay, denNgay, pageSize, pageNum);
		gvDonHang.DataSource = donHangPhanTrang.DanhSachDonHang;
		gvDonHang.DataBind();
	}

	private void LoadDataUserReceived()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayUserByWebsiteReceived(ddWebsite.SelectedValue);
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				ddUserName.DataSource = dataSet.Tables[0];
				ddUserName.DataBind();
			}
			ddUserName.Items.Insert(0, new ListItem("--Tất cả user--", ""));
		}
		catch
		{
		}
	}

	private void LoadDataWebsiteReceived()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LayWebsiteByReceived();
			if (dataSet != null && dataSet.Tables.Count > 0)
			{
				ddWebsite.DataSource = dataSet.Tables[0];
				ddWebsite.DataBind();
			}
			ddWebsite.Items.Insert(0, new ListItem("--Tất cả website--", ""));
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
			ddQuocGia.Items.Insert(0, new ListItem("--Tất cả quốc gia--", "-1"));
		}
		catch
		{
		}
	}

	private void LoadDataWebsite(DropDownList ddgvWebsite, string Selecteditemvalue)
	{
		try
		{
			BLL bLL = new BLL();
			ddgvWebsite.DataSource = bLL.LayDanhSachWebsite();
			ddgvWebsite.DataBind();
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvWebsite.ClearSelection();
				ListItem listItem = ddgvWebsite.Items.FindByValue(Selecteditemvalue);
				if (listItem != null)
				{
					listItem.Selected = true;
				}
			}
			ddgvWebsite.Items.Insert(0, new ListItem("--Web khac--", "--Web khac--"));
		}
		catch
		{
		}
	}

	private void LoadDataUser(DropDownList ddgvUserName, string Selecteditemvalue)
	{
		try
		{
			UserManager userManager = new UserManager();
			ddgvUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddgvUserName.DataBind();
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvUserName.ClearSelection();
				ListItem listItem = ddgvUserName.Items.FindByValue(Selecteditemvalue);
				if (listItem != null)
				{
					listItem.Selected = true;
				}
			}
			ddgvUserName.Items.Insert(0, new ListItem("--Temporary user--", ""));
		}
		catch
		{
		}
	}

	private void LoadDataTyGia(DropDownList ddgvLoaiTien, string Selecteditemvalue)
	{
		try
		{
			BLL bLL = new BLL();
			ddgvLoaiTien.DataSource = bLL.LayDanhSachTyGia();
			ddgvLoaiTien.DataBind();
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvLoaiTien.ClearSelection();
				ListItem listItem = ddgvLoaiTien.Items.FindByText(Selecteditemvalue);
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

	private void LoadDataQuocGia(DropDownList ddgvQuocGia, string Selecteditemvalue)
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			ddgvQuocGia.DataSource = dBConnect.LayDanhSachQuocGia();
			ddgvQuocGia.DataBind();
			if (!string.IsNullOrEmpty(Selecteditemvalue))
			{
				ddgvQuocGia.ClearSelection();
				ListItem listItem = ddgvQuocGia.Items.FindByValue(Selecteditemvalue);
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

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		gvDonHang.EditIndex = -1;
		LoadDanhSachDonHang();
	}

	protected void gvDonHang_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && (e.Row.RowState & DataControlRowState.Edit) == DataControlRowState.Edit)
		{
			DonHang donHang = (DonHang)e.Row.DataItem;
			DropDownList ddgvWebsite = (DropDownList)e.Row.FindControl("ddgvWebsite");
			LoadDataWebsite(ddgvWebsite, donHang.WebsiteName);
			DropDownList ddgvUserName = (DropDownList)e.Row.FindControl("ddgvUsername");
			LoadDataUser(ddgvUserName, donHang.username);
			DropDownList ddgvLoaiTien = (DropDownList)e.Row.FindControl("ddgvLoaiTien");
			LoadDataTyGia(ddgvLoaiTien, donHang.loaitien);
			DropDownList ddgvQuocGia = (DropDownList)e.Row.FindControl("ddgvQuocGia");
			LoadDataQuocGia(ddgvQuocGia, donHang.QuocGiaID.HasValue ? donHang.QuocGiaID.Value.ToString() : "");
			TextBox textBox = (TextBox)e.Row.FindControl("tbgvTax");
			textBox.Text = donHang.tax.ToString();
			TextBox textBox2 = (TextBox)e.Row.FindControl("tbgvCong");
			UserManager manager = new UserManager();
			ApplicationUser applicationUser = manager.FindByName(donHang.username);
			DBConnect dBConnect = new DBConnect();
			if (donHang.cong.HasValue)
			{
				textBox2.Text = donHang.cong.Value.ToString();
			}
			else if (applicationUser.KhachBuon)
			{
				textBox2.Text = "0";
			}
			else
			{
				textBox2.Text = "0";
			}
			BLL bLL = new BLL();
			GiaTienCong giaTienCong = bLL.LayGiaTienCong(donHang.loaitien, donHang.dongiaweb, applicationUser.KhachBuon);
			if (giaTienCong.TinhTheoPhanTram)
			{
				textBox2.Enabled = true;
			}
			else
			{
				textBox2.Enabled = false;
			}
		}
	}

	protected void gvDonHang_DataBound(object sender, EventArgs e)
	{
	}

	protected void gvDonHang_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		DropDownList dropDownList = gvDonHang.FooterRow.FindControl("ddWebsite") as DropDownList;
		DropDownList dropDownList2 = gvDonHang.FooterRow.FindControl("ddUsername") as DropDownList;
		DropDownList dropDownList3 = gvDonHang.FooterRow.FindControl("ddLoaiTien") as DropDownList;
		TextBox textBox = gvDonHang.FooterRow.FindControl("tbLinkWeb") as TextBox;
		TextBox textBox2 = gvDonHang.FooterRow.FindControl("tbLinkHinh") as TextBox;
		TextBox textBox3 = gvDonHang.FooterRow.FindControl("tbCorlor") as TextBox;
		TextBox textBox4 = gvDonHang.FooterRow.FindControl("tbSize") as TextBox;
		TextBox textBox5 = gvDonHang.FooterRow.FindControl("tbSoluong") as TextBox;
		TextBox textBox6 = gvDonHang.FooterRow.FindControl("tbGiaWeb") as TextBox;
		TextBox textBox7 = gvDonHang.FooterRow.FindControl("tbGhichu") as TextBox;
		if (!(e.CommandName == "Edit") && !(e.CommandName == "Update"))
		{
		}
	}

	protected void ddWebsite_SelectedIndexChanged(object sender, EventArgs e)
	{
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
			DropDownList dropDownList = gvDonHang.Rows[e.RowIndex].FindControl("ddgvWebsite") as DropDownList;
			DropDownList dropDownList2 = gvDonHang.Rows[e.RowIndex].FindControl("ddgvUsername") as DropDownList;
			DropDownList dropDownList3 = gvDonHang.Rows[e.RowIndex].FindControl("ddgvLoaiTien") as DropDownList;
			TextBox textBox = gvDonHang.Rows[e.RowIndex].FindControl("tbLinkWeb") as TextBox;
			TextBox textBox2 = gvDonHang.Rows[e.RowIndex].FindControl("tbLinkHinh") as TextBox;
			TextBox textBox3 = gvDonHang.Rows[e.RowIndex].FindControl("tbCorlor") as TextBox;
			TextBox textBox4 = gvDonHang.Rows[e.RowIndex].FindControl("tbSize") as TextBox;
			TextBox textBox5 = gvDonHang.Rows[e.RowIndex].FindControl("tbSoluong") as TextBox;
			TextBox textBox6 = gvDonHang.Rows[e.RowIndex].FindControl("tbGiaWeb") as TextBox;
			TextBox textBox7 = gvDonHang.Rows[e.RowIndex].FindControl("tbSaleOff") as TextBox;
			TextBox textBox8 = gvDonHang.Rows[e.RowIndex].FindControl("tbGhichu") as TextBox;
			FileUpload fileUpload = gvDonHang.Rows[e.RowIndex].FindControl("fuHinhAnh") as FileUpload;
			string text = textBox2.Text;
			TextBox textBox9 = gvDonHang.Rows[e.RowIndex].FindControl("tbgvCong") as TextBox;
			TextBox textBox10 = gvDonHang.Rows[e.RowIndex].FindControl("tbPhuThu") as TextBox;
			TextBox textBox11 = gvDonHang.Rows[e.RowIndex].FindControl("tbShipUS") as TextBox;
			TextBox textBox12 = gvDonHang.Rows[e.RowIndex].FindControl("tbgvTax") as TextBox;
			DropDownList dropDownList4 = gvDonHang.Rows[e.RowIndex].FindControl("ddgvQuocGia") as DropDownList;
			double result = 0.0;
			DBConnect dBConnect = new DBConnect();
			if (string.IsNullOrEmpty(text) && !string.IsNullOrEmpty(fileUpload.FileName))
			{
				string text2 = DateTime.Now.ToString("yyyyMM");
				string text3 = base.Server.MapPath("/imgLink").TrimEnd('\\') + "\\" + text2 + "\\";
				if (!Directory.Exists(text3))
				{
					Directory.CreateDirectory(text3);
				}
				string text4 = Guid.NewGuid().ToString() + Path.GetExtension(fileUpload.FileName);
				string filename = text3 + text4;
				try
				{
					fileUpload.SaveAs(filename);
					System.Drawing.Image image = System.Drawing.Image.FromFile(filename);
					System.Drawing.Image image2 = Utils.ResizeImage(image, new Size(640, 480));
					image.Dispose();
					image2.Save(filename);
					text = "/imgLink/" + text2 + "/" + text4;
				}
				catch (Exception)
				{
				}
			}
			double result2;
			if (string.IsNullOrEmpty(textBox12.Text.Trim()))
			{
				result2 = 0.0;
			}
			else if (!double.TryParse(textBox12.Text.Trim(), out result2))
			{
				return;
			}
			if (string.IsNullOrEmpty(textBox9.Text.Trim()))
			{
				result = 0.0;
			}
			else if (!double.TryParse(textBox9.Text.Trim(), out result))
			{
				return;
			}
			double result3;
			if (string.IsNullOrEmpty(textBox10.Text.Trim()))
			{
				result3 = 0.0;
			}
			else if (!double.TryParse(textBox10.Text.Trim(), out result3))
			{
				return;
			}
			double result4;
			if (string.IsNullOrEmpty(textBox7.Text.Trim()))
			{
				result4 = 0.0;
			}
			else if (!double.TryParse(textBox7.Text.Trim(), out result4))
			{
				return;
			}
			double result5;
			if (string.IsNullOrEmpty(textBox11.Text.Trim()))
			{
				result5 = 0.0;
			}
			else if (!double.TryParse(textBox11.Text.Trim(), out result5))
			{
				return;
			}
			dBConnect.CapNhatDonHangSimpleCoTamTinh(iD, dropDownList.SelectedValue, dropDownList2.SelectedValue, textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), dropDownList3.SelectedItem.Text.Trim(), textBox8.Text.Trim(), Convert.ToDouble(dropDownList3.SelectedValue), result4, result, result5, result2, result3, Convert.ToInt32(dropDownList4.SelectedValue), base.User.Identity.GetUserName());
			BLL bLL = new BLL();
			string text5 = bLL.NoiDungDonHangSystemLogs(dropDownList2.SelectedValue, textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), result4, result3, result5, result2, 0.0, dropDownList3.SelectedItem.Text.Trim(), textBox8.Text.Trim(), Convert.ToDouble(dropDownList3.SelectedValue), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", DateTime.Now.ToString("dd/MM/yyyy HH:mm"), "", "");
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "QLDatHang_LietKe:CapNhatDonHangSimpleCoTamTinh", StringEnum.GetStringValue(HanhDong.ChinhSua), iD.ToString(), "ID:" + iD + "; " + text5);
			gvDonHang.EditIndex = -1;
			LoadDanhSachDonHang();
		}
		catch (Exception)
		{
		}
	}

	protected void gvDonHang_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
	{
		gvDonHang.EditIndex = -1;
		LoadDanhSachDonHang();
	}

	protected void lbtMassUpdate_Click(object sender, EventArgs e)
	{
		string text = "";
		string text2 = "";
		for (int i = 0; i < gvDonHang.Rows.Count; i++)
		{
			if (((CheckBox)gvDonHang.Rows[i].FindControl("SelectCheckBox")).Checked)
			{
				text = ((!string.IsNullOrEmpty(text)) ? (text + "," + gvDonHang.DataKeys[i]["ID"].ToString()) : gvDonHang.DataKeys[i]["ID"].ToString());
				if (string.IsNullOrEmpty(text2))
				{
					text2 = ((Label)gvDonHang.Rows[i].Cells[2].FindControl("lbWebsite")).Text.Trim();
				}
			}
		}
		if (!string.IsNullOrEmpty(text))
		{
			Page.Response.Redirect("/admin/QLDatHang_MassUpdate.aspx?id=" + text + "&ws=" + text2);
		}
	}

	protected void lbtMassDelete_Click(object sender, EventArgs e)
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
			dBConnect.MassDelete(text, base.User.Identity.GetUserName());
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "QLDatHang_LietKe:MassDelete", StringEnum.GetStringValue(HanhDong.Xoa), "", "ID: " + text);
			LoadDanhSachDonHang();
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
			Page.Response.Redirect("/admin/QLDatHang_MassCancel.aspx?id=" + text);
		}
	}
}
