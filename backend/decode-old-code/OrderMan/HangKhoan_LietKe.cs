using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class HangKhoan_LietKe : Page
{
	private int pageNum = 1;

	private int pageSize = 200;

	protected CheckBoxList cblTrangThaiOrder;

	protected TextBox tbNoiDungTim;

	protected TextBox tbMaDatHang;

	protected DropDownList ddWebsite;

	protected DropDownList ddUserName;

	protected Button btTimKiem;

	protected Label lblTotalCount;

	protected Label lblTotalPrice;

	protected LinkButton lbtMassUpdate;

	protected LinkButton lbtMassDelete;

	protected LinkButton lbtMassCancel;

	protected GridView gvDonHang;

	protected ucPhanTrang myPager;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			myPager.BuildPaging(pageNum, -1, pageSize);
			LoadSoLuongDonHang();
			LoadDataWebsiteReceived();
			LoadDataUserReceived();
			if (base.User.IsInRole("Admin"))
			{
				lbtMassDelete.Visible = true;
			}
		}
	}

	private void LoadSoLuongDonHang()
	{
		try
		{
			DBConnect dBConnect = new DBConnect();
			DataSet dataSet = dBConnect.LaySoLuongDonHang("", 1);
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
		DonHangPhanTrang donHangPhanTrang = bLL.LayDanhSachDonHang(ddWebsite.SelectedValue, ddUserName.SelectedValue, text, tbNoiDungTim.Text, -1, tbMaDatHang.Text, "", 1, -1, DaXoa: false, "", "", pageSize, pageNum);
		gvDonHang.DataSource = donHangPhanTrang.DanhSachDonHang;
		gvDonHang.DataBind();
		myPager.BuildPaging(pageNum, donHangPhanTrang.TotalItem, pageSize);
		try
		{
			gvDonHang.FooterRow.Visible = false;
		}
		catch
		{
		}
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
			ddUserName.Items.Insert(0, new ListItem("--All--", ""));
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
			ddWebsite.Items.Insert(0, new ListItem("--All--", ""));
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

	protected void btTimKiem_Click(object sender, EventArgs e)
	{
		pageNum = 1;
		gvDonHang.EditIndex = -1;
		LoadDanhSachDonHang();
	}

	protected void myPager_PageChanged(object sender, EventArgs e)
	{
		pageNum = myPager.intPageIndex;
		LoadDanhSachDonHang();
	}

	protected void gvDonHang_RowDataBound(object sender, GridViewRowEventArgs e)
	{
		if (e.Row.RowType == DataControlRowType.DataRow && (e.Row.RowState & DataControlRowState.Edit) == DataControlRowState.Edit)
		{
			DropDownList ddgvWebsite = (DropDownList)e.Row.FindControl("ddgvWebsite");
			LoadDataWebsite(ddgvWebsite, ((DonHang)e.Row.DataItem).WebsiteName);
			DropDownList ddgvUserName = (DropDownList)e.Row.FindControl("ddgvUsername");
			LoadDataUser(ddgvUserName, ((DonHang)e.Row.DataItem).username);
		}
	}

	protected void gvDonHang_DataBound(object sender, EventArgs e)
	{
		try
		{
			DropDownList dropDownList = gvDonHang.FooterRow.FindControl("gvft_ddUsername") as DropDownList;
			UserManager userManager = new UserManager();
			List<ApplicationUser> list = new List<ApplicationUser>(userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList());
			list.Insert(0, new ApplicationUser
			{
				UserName = "--Temporary user--"
			});
			dropDownList.DataSource = list;
			dropDownList.DataBind();
			BLL bLL = new BLL();
			DropDownList dropDownList2 = gvDonHang.FooterRow.FindControl("gvft_ddWebsite") as DropDownList;
			List<Website> dataSource = bLL.LayDanhSachWebsite();
			dropDownList2.DataSource = dataSource;
			dropDownList2.DataBind();
			dropDownList2.Items.Insert(0, new ListItem("--Web khac--", "--Web khac--"));
		}
		catch
		{
		}
	}

	protected void gvDonHang_RowCommand(object sender, GridViewCommandEventArgs e)
	{
		DropDownList dropDownList = gvDonHang.FooterRow.FindControl("gvft_ddWebsite") as DropDownList;
		DropDownList dropDownList2 = gvDonHang.FooterRow.FindControl("gvft_ddUsername") as DropDownList;
		TextBox textBox = gvDonHang.FooterRow.FindControl("gvft_tbLinkWeb") as TextBox;
		TextBox textBox2 = gvDonHang.FooterRow.FindControl("gvft_tbLinkHinh") as TextBox;
		TextBox textBox3 = gvDonHang.FooterRow.FindControl("gvft_tbCorlor") as TextBox;
		TextBox textBox4 = gvDonHang.FooterRow.FindControl("gvft_tbSize") as TextBox;
		TextBox textBox5 = gvDonHang.FooterRow.FindControl("gvft_tbSoluong") as TextBox;
		TextBox textBox6 = gvDonHang.FooterRow.FindControl("gvft_tbGiaWeb") as TextBox;
		TextBox textBox7 = gvDonHang.FooterRow.FindControl("gvft_tbGhichu") as TextBox;
		FileUpload fileUpload = gvDonHang.FooterRow.FindControl("fuHinhAnh") as FileUpload;
		string text = textBox2.Text;
		if (e.CommandName == "Copy")
		{
			int iD = int.Parse(e.CommandArgument.ToString());
			BLL bLL = new BLL();
			DonHang donHang = bLL.LayDonHangByID(iD);
			try
			{
				dropDownList.ClearSelection();
				dropDownList.Items.FindByValue(donHang.WebsiteName).Selected = true;
			}
			catch
			{
			}
			try
			{
				dropDownList2.ClearSelection();
				dropDownList2.Items.FindByValue(donHang.username).Selected = true;
			}
			catch
			{
			}
			textBox.Text = donHang.linkweb;
			textBox2.Text = donHang.linkhinh;
			textBox3.Text = donHang.corlor;
			textBox4.Text = donHang.size;
			textBox5.Text = donHang.soluong.ToString();
			textBox6.Text = donHang.dongiaweb.ToString("N0");
			textBox7.Text = donHang.ghichu;
			gvDonHang.FooterRow.Visible = true;
		}
		else
		{
			if (!(e.CommandName == "Insert"))
			{
				return;
			}
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
			if (dBConnect.ThemDatHangSimple(dropDownList.SelectedValue, dropDownList2.SelectedValue, base.User.Identity.GetUserName(), textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), "VND", textBox7.Text.Trim(), 1.0, 0.0, HangKhoan: true, null, "", null))
			{
				BLL bLL2 = new BLL();
				string noiDung = bLL2.NoiDungDonHangSystemLogs(dropDownList2.SelectedValue, textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), 0.0, 0.0, 0.0, 0.0, 0.0, "VND", textBox7.Text.Trim(), 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", DateTime.Now.ToString("dd/MM/yyyy HH:mm"), "", "");
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "HangKhoan_LietKe:ThemDatHangSimple", StringEnum.GetStringValue(HanhDong.ThemMoi), "", noiDung);
				LoadDanhSachDonHang();
			}
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
			TextBox textBox = gvDonHang.Rows[e.RowIndex].FindControl("tbLinkWeb") as TextBox;
			TextBox textBox2 = gvDonHang.Rows[e.RowIndex].FindControl("tbLinkHinh") as TextBox;
			TextBox textBox3 = gvDonHang.Rows[e.RowIndex].FindControl("tbCorlor") as TextBox;
			TextBox textBox4 = gvDonHang.Rows[e.RowIndex].FindControl("tbSize") as TextBox;
			TextBox textBox5 = gvDonHang.Rows[e.RowIndex].FindControl("tbSoluong") as TextBox;
			TextBox textBox6 = gvDonHang.Rows[e.RowIndex].FindControl("tbGiaWeb") as TextBox;
			TextBox textBox7 = gvDonHang.Rows[e.RowIndex].FindControl("tbGhichu") as TextBox;
			FileUpload fileUpload = gvDonHang.Rows[e.RowIndex].FindControl("fuHinhAnh") as FileUpload;
			string text = textBox2.Text;
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
			dBConnect.CapNhatDonHangSimple(iD, dropDownList.SelectedValue, dropDownList2.SelectedValue, textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), "VND", textBox7.Text.Trim(), 1.0, 0.0, null, "", null, base.User.Identity.GetUserName());
			gvDonHang.EditIndex = -1;
			LoadDanhSachDonHang();
			BLL bLL = new BLL();
			string text5 = bLL.NoiDungDonHangSystemLogs(dropDownList2.SelectedValue, textBox.Text.Trim(), text.Trim(), textBox3.Text.Trim(), textBox4.Text.Trim(), Convert.ToInt32(textBox5.Text.Trim()), Convert.ToDouble(textBox6.Text.Trim()), 0.0, 0.0, 0.0, 0.0, 0.0, "VND", textBox7.Text.Trim(), 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", "", "", "");
			dBConnect.ThemSystemLogs(dropDownList2.SelectedValue, "HangKhoan_LietKe", StringEnum.GetStringValue(HanhDong.ChinhSua), "", "ID: " + iD + "; " + text5);
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
			Page.Response.Redirect("/admin/HangKhoan_MassUpdate.aspx?id=" + text + "&ws=" + text2);
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
