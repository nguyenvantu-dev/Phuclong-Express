using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;

namespace OrderMan;

public class SuaDonHang : Page
{
	private DonHang DH;

	protected Label lbLoi;

	protected TextBox tbMaSoHang;

	protected TextBox tbLinkHang;

	protected TextBox tbLinkHinh;

	protected FileUpload fuHinhAnh;

	protected TextBox tbMausac;

	protected TextBox tbSize;

	protected TextBox tbSoluong;

	protected TextBox tbGiaweb;

	protected TextBox tbSaleOff;

	protected TextBox tbGhichu;

	protected DropDownList drLoaitien;

	protected TextBox tbTyGia;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataTyGia();
			if (!int.TryParse(Page.Request.QueryString["id"], out var result))
			{
				Page.Response.Redirect("/UF/DanhSachDonHang.aspx");
			}
			else
			{
				LoadDataDonHang(result);
			}
		}
	}

	private void LoadDataTyGia()
	{
		try
		{
			BLL bLL = new BLL();
			List<TyGia> dataSource = bLL.LayDanhSachTyGia();
			drLoaitien.DataSource = dataSource;
			drLoaitien.DataBind();
			ListItem listItem = drLoaitien.Items.FindByText("YEN");
			if (listItem != null)
			{
				drLoaitien.ClearSelection();
				listItem.Selected = true;
			}
			tbTyGia.Text = drLoaitien.SelectedValue;
		}
		catch
		{
		}
	}

	private void LoadDataDonHang(int id)
	{
		BLL bLL = new BLL();
		DH = bLL.LayDonHangByID(id);
		if (DH.trangthaiOrder != "Received")
		{
			lbLoi.Text = "Chỉ được sửa những đơn hàng ở trạng thái Received";
			string text = "";
			text = "<script type='text/javascript'>alert('Chỉ được sửa những đơn hàng ở trạng thái Received'); window.location.href = '/UF/DanhSachDonHang.aspx';</script>";
			base.Response.Write(text);
			return;
		}
		if (DH.saleoff.HasValue)
		{
			tbSaleOff.Text = DH.saleoff.Value.ToString();
		}
		tbLinkHang.Text = DH.linkweb;
		tbLinkHinh.Text = DH.linkhinh;
		tbMausac.Text = DH.corlor;
		tbSize.Text = DH.size;
		tbSoluong.Text = DH.soluong.ToString();
		tbGiaweb.Text = DH.dongiaweb.ToString("N2");
		tbGhichu.Text = DH.ghichu;
		tbMaSoHang.Text = DH.MaSoHang;
		try
		{
			drLoaitien.ClearSelection();
			drLoaitien.Items.FindByText(DH.loaitien).Selected = true;
			tbTyGia.Text = DH.tygia.ToString();
		}
		catch
		{
		}
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		double tygia = Convert.ToDouble(tbTyGia.Text.Trim());
		if (!int.TryParse(tbSoluong.Text.Trim(), out var result))
		{
			lbLoi.Text = "Số lượng phải là kiểu số";
			return;
		}
		if (!double.TryParse(tbGiaweb.Text.Trim(), out var result2))
		{
			lbLoi.Text = "Đơn giá phải là kiểu số";
			return;
		}
		if (!int.TryParse(tbSaleOff.Text.Trim(), out var result3))
		{
			lbLoi.Text = "Sale off phải là kiểu số";
			return;
		}
		string text = tbLinkHinh.Text;
		if (string.IsNullOrEmpty(text) && !string.IsNullOrEmpty(fuHinhAnh.FileName))
		{
			string text2 = DateTime.Now.ToString("yyyyMM");
			string text3 = base.Server.MapPath("/imgLink").TrimEnd('\\') + "\\" + text2 + "\\";
			if (!Directory.Exists(text3))
			{
				Directory.CreateDirectory(text3);
			}
			string text4 = Guid.NewGuid().ToString() + Path.GetExtension(fuHinhAnh.FileName);
			string filename = text3 + text4;
			try
			{
				fuHinhAnh.SaveAs(filename);
				System.Drawing.Image image = System.Drawing.Image.FromFile(filename);
				System.Drawing.Image image2 = Utils.ResizeImage(image, new Size(640, 480));
				image.Dispose();
				image2.Save(filename);
				text = "/imgLink/" + text2 + "/" + text4;
			}
			catch (Exception ex)
			{
				throw ex;
			}
		}
		DBConnect dBConnect = new DBConnect();
		Uri uri = new Uri(tbLinkHang.Text.Trim());
		string host = uri.Host;
		if (dBConnect.CapNhatDonHangSimple(Convert.ToInt32(Page.Request.QueryString["id"]), host, base.User.Identity.GetUserName(), tbLinkHang.Text.Trim(), text.Trim(), tbMausac.Text.Trim(), tbSize.Text.Trim(), result, result2, drLoaitien.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), tygia, result3, null, tbMaSoHang.Text.Trim(), null, base.User.Identity.GetUserName()))
		{
			BLL bLL = new BLL();
			string text5 = bLL.NoiDungDonHangSystemLogs(base.User.Identity.GetUserName(), tbLinkHang.Text.Trim(), text.Trim(), tbMausac.Text.Trim(), tbSize.Text.Trim(), result, result2, result3, 0.0, 0.0, 0.0, 0.0, drLoaitien.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), tygia, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, "", "", DateTime.Now.ToString("dd/MM/yyyy HH:mm"), "", "");
			dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "SuaDonHang:CapNhatDonHangSimple", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID:" + Page.Request.QueryString["id"] + "; " + text5);
			string text6 = "";
			text6 = "<script type='text/javascript'>alert('Cập nhật đơn hàng thành công'); window.location.href = '/UF/DanhSachDonHang.aspx';</script>";
			base.Response.Write(text6);
		}
		else
		{
			lbLoi.Text = "Có lỗi trong quá trình thao tác!!!!";
		}
	}

	private void ClearInputData()
	{
		tbLinkHang.Text = "";
		tbLinkHinh.Text = "";
		tbMausac.Text = "";
		tbSize.Text = "";
		tbSoluong.Text = "";
		tbGiaweb.Text = "";
		tbGhichu.Text = "";
	}
}
