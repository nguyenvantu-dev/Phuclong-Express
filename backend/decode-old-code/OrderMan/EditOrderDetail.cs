using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.AspNet.Identity;
using OrderMan.Models;

namespace OrderMan;

public class EditOrderDetail : Page
{
	protected Label lbLoi;

	protected TextBox tbOrderNumber;

	protected DropDownList drStatus;

	protected TextBox tbPhuThu;

	protected TextBox tbSaleOff;

	protected TextBox tbShipUSA;

	protected TextBox tbTax;

	protected TextBox tbLinkHang;

	protected TextBox tbLinkHinh;

	protected DropDownList ddLoaiHang;

	protected FileUpload fuHinhAnh;

	protected TextBox tbMausac;

	protected TextBox tbSize;

	protected TextBox tbSoluong;

	protected TextBox tbGiaweb;

	protected DropDownList ddQuocGia;

	protected TextBox tbGhichu;

	protected TextBox tbCong;

	protected DropDownList drLoaitien;

	protected TextBox tbTygia;

	protected TextBox tbTienUSD;

	protected TextBox tbTienVND;

	protected TextBox tbCongUSD;

	protected TextBox tbCongVND;

	protected TextBox tbTongTienUSD;

	protected TextBox tbTongTienVND;

	protected TextBox tbNgayDatHang;

	protected DropDownList ddUserName;

	protected TextBox tbNgayVeVN;

	protected TextBox tbAdminNote;

	protected Button btCapNhat;

	protected void Page_Load(object sender, EventArgs e)
	{
		if (!base.IsPostBack)
		{
			LoadDataTyGia();
			LoadDataUser();
			LoadDataLoaiHang();
			LoadDataQuocGia();
			if (!int.TryParse(Page.Request.QueryString["id"], out var result))
			{
				Page.Response.Redirect("/admin/EditOrder.aspx");
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
			tbTygia.Text = drLoaitien.SelectedValue;
		}
		catch
		{
		}
	}

	private void LoadDataUser()
	{
		try
		{
			UserManager userManager = new UserManager();
			ddUserName.DataSource = userManager.Users.OrderBy((ApplicationUser u) => u.UserName).ToList();
			ddUserName.DataBind();
		}
		catch
		{
		}
	}

	private void LoadDataDonHang(int id)
	{
		BLL bLL = new BLL();
		DonHang donHang = bLL.LayDonHangByID(id);
		tbOrderNumber.Text = donHang.ordernumber;
		try
		{
			drStatus.ClearSelection();
			drStatus.Items.FindByValue(donHang.trangthaiOrder).Selected = true;
		}
		catch
		{
		}
		if (donHang.phuthu.HasValue)
		{
			tbPhuThu.Text = donHang.phuthu.Value.ToString();
		}
		if (donHang.saleoff.HasValue)
		{
			tbSaleOff.Text = donHang.saleoff.Value.ToString();
		}
		if (donHang.shipUSA.HasValue)
		{
			tbShipUSA.Text = donHang.shipUSA.Value.ToString();
		}
		try
		{
			tbTax.Text = donHang.tax.ToString();
		}
		catch
		{
		}
		tbLinkHang.Text = donHang.linkweb;
		tbLinkHinh.Text = donHang.linkhinh;
		tbMausac.Text = donHang.corlor;
		tbSize.Text = donHang.size;
		tbSoluong.Text = donHang.soluong.ToString();
		tbGiaweb.Text = donHang.dongiaweb.ToString("N2");
		tbGhichu.Text = donHang.ghichu;
		try
		{
			ddQuocGia.ClearSelection();
			ddQuocGia.Items.FindByValue(donHang.QuocGiaID.ToString()).Selected = true;
		}
		catch
		{
		}
		try
		{
			UserManager manager = new UserManager();
			ApplicationUser applicationUser = manager.FindByName(donHang.username);
			if (donHang.cong.HasValue)
			{
				tbCong.Text = donHang.cong.Value.ToString();
			}
			else if (applicationUser.KhachBuon)
			{
				tbCong.Text = "0";
			}
			else
			{
				tbCong.Text = "0";
			}
			GiaTienCong giaTienCong = bLL.LayGiaTienCong(donHang.loaitien, donHang.dongiaweb, applicationUser.KhachBuon);
			if (giaTienCong.TinhTheoPhanTram)
			{
				tbCong.Enabled = true;
			}
			else
			{
				tbCong.Enabled = false;
			}
		}
		catch
		{
		}
		try
		{
			drLoaitien.ClearSelection();
			drLoaitien.Items.FindByText(donHang.loaitien).Selected = true;
			tbTygia.Text = donHang.tygia.ToString();
		}
		catch
		{
		}
		try
		{
			ddLoaiHang.ClearSelection();
			ddLoaiHang.Items.FindByValue(donHang.LoaiHangID.ToString()).Selected = true;
		}
		catch
		{
		}
		if (donHang.giasauoffUSD.HasValue)
		{
			tbTienUSD.Text = donHang.giasauoffUSD.Value.ToString("N2");
		}
		if (donHang.tiencongUSD.HasValue)
		{
			tbCongUSD.Text = donHang.tiencongUSD.Value.ToString("N2");
		}
		if (donHang.tongtienUSD.HasValue)
		{
			tbTongTienUSD.Text = donHang.tongtienUSD.Value.ToString("N2");
		}
		if (donHang.giasauoffVND.HasValue)
		{
			tbTienVND.Text = donHang.giasauoffVND.Value.ToString("N0");
		}
		if (donHang.tiencongVND.HasValue)
		{
			tbCongVND.Text = donHang.tiencongVND.Value.ToString("N0");
		}
		if (donHang.tongtienVND.HasValue)
		{
			tbTongTienVND.Text = donHang.tongtienVND.Value.ToString("N0");
		}
		if (donHang.ngayveVN.HasValue)
		{
			tbNgayVeVN.Text = donHang.ngayveVN.Value.ToString("dd/MM/yyyy");
		}
		try
		{
			ddUserName.ClearSelection();
			ddUserName.Items.FindByValue(donHang.username).Selected = true;
		}
		catch
		{
		}
		tbAdminNote.Text = donHang.AdminNote;
		if (donHang.ngaymuahang.HasValue)
		{
			tbNgayDatHang.Text = donHang.ngaymuahang.Value.ToString("dd/MM/yyyy");
		}
	}

	private void LoadDataLoaiHang()
	{
		try
		{
			BLL bLL = new BLL();
			ddLoaiHang.DataSource = bLL.LayDanhSachLoaiHang();
			ddLoaiHang.DataBind();
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
		}
		catch
		{
		}
	}

	protected void btCapNhat_Click(object sender, EventArgs e)
	{
		double tygia = Convert.ToDouble(tbTygia.Text.Trim());
		double giasauoffUSD = Convert.ToDouble(tbTienUSD.Text.Trim());
		double giasauoffVND = Convert.ToDouble(tbTienVND.Text.Trim());
		double tiencongUSD = Convert.ToDouble(tbCongUSD.Text.Trim());
		double tiencongVND = Convert.ToDouble(tbCongVND.Text.Trim());
		double tongtienUSD = Convert.ToDouble(tbTongTienUSD.Text.Trim());
		double tongtienVND = Convert.ToDouble(tbTongTienVND.Text.Trim());
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
		if (!double.TryParse(tbPhuThu.Text.Trim(), out var result4))
		{
			result4 = 0.0;
		}
		if (!double.TryParse(tbShipUSA.Text.Trim(), out var result5))
		{
			result5 = 0.0;
		}
		if (!double.TryParse(tbCong.Text.Trim(), out var result6))
		{
			result6 = 0.0;
		}
		if (!double.TryParse(tbTax.Text.Trim(), out var result7))
		{
			result7 = 0.0;
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
		switch (dBConnect.KiemTraDuocCapNhatDonHang(Convert.ToInt32(Page.Request.QueryString["id"]), ddUserName.SelectedValue))
		{
		case 0:
			if (dBConnect.CapNhatDonHang(Convert.ToInt32(Page.Request.QueryString["id"]), ddUserName.SelectedValue, base.User.Identity.GetUserName(), tbLinkHang.Text.Trim(), text.Trim(), tbMausac.Text.Trim(), tbSize.Text.Trim(), result, result2, result3, result4, result5, result7, result6, drLoaitien.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), tygia, giasauoffUSD, giasauoffVND, tiencongUSD, tiencongVND, tongtienUSD, tongtienVND, tbOrderNumber.Text.Trim(), drStatus.SelectedItem.Text.Trim(), DateTimeUtil.getDatetimeFromStr(tbNgayDatHang.Text.Trim()), DateTimeUtil.getDatetimeFromStr(tbNgayVeVN.Text.Trim()), tbAdminNote.Text.Trim(), null, Convert.ToInt32(ddQuocGia.SelectedValue), base.User.Identity.GetUserName()))
			{
				BLL bLL = new BLL();
				string text5 = bLL.NoiDungDonHangSystemLogs(ddUserName.SelectedValue, tbLinkHang.Text.Trim(), text.Trim(), tbMausac.Text.Trim(), tbSize.Text.Trim(), result, result2, result3, result4, result5, result7, result6, drLoaitien.SelectedItem.Text.Trim(), tbGhichu.Text.Trim(), tygia, giasauoffUSD, giasauoffVND, tiencongUSD, tiencongVND, tongtienUSD, tongtienVND, tbOrderNumber.Text.Trim(), drStatus.SelectedItem.Text.Trim(), DateTime.Now.ToString("dd/MM/yyyy HH:mm"), tbNgayDatHang.Text.Trim(), "");
				dBConnect.ThemSystemLogs(base.User.Identity.GetUserName(), "EditOrderDetail:CapNhatDonHang", StringEnum.GetStringValue(HanhDong.ChinhSua), Page.Request.QueryString["id"], "ID: " + Page.Request.QueryString["id"] + "; " + text5);
				DateTime? datetimeFromStr = DateTimeUtil.getDatetimeFromStr(tbNgayVeVN.Text.Trim());
				if (datetimeFromStr.HasValue)
				{
					dBConnect.CapNhatNgayVeVN(Page.Request.QueryString["id"], datetimeFromStr, "", ChuyenSangComplete: false);
				}
				Page.Response.Redirect("/admin/EditOrder.aspx");
			}
			else
			{
				lbLoi.Text = "Có lỗi trong quá trình thao tác!!!!";
			}
			break;
		case 1:
			lbLoi.Text = "Không được cập nhật đơn hàng này do đã đóng kỳ";
			break;
		case -1:
			lbLoi.Text = "Có lỗi trong quá trình thao tác!!!!";
			break;
		}
	}

	private void ClearInputData()
	{
		tbPhuThu.Text = "";
		tbSaleOff.Text = "0";
		tbShipUSA.Text = "";
		tbLinkHang.Text = "";
		tbLinkHinh.Text = "";
		tbMausac.Text = "";
		tbSize.Text = "";
		tbSoluong.Text = "";
		tbGiaweb.Text = "";
		tbGhichu.Text = "";
	}

	private void KhoaThongTinTruocKhiLuu(bool Khoa)
	{
		btCapNhat.Enabled = Khoa;
	}

	protected void btNhapLai_Click(object sender, EventArgs e)
	{
		KhoaThongTinTruocKhiLuu(Khoa: false);
	}

	protected void drLoaitien_SelectedIndexChanged(object sender, EventArgs e)
	{
		if (!double.TryParse(tbGiaweb.Text.Trim(), out var result))
		{
			lbLoi.Text = "Đơn giá phải là kiểu số";
			return;
		}
		UserManager manager = new UserManager();
		ApplicationUser applicationUser = manager.FindByName(ddUserName.SelectedValue);
		BLL bLL = new BLL();
		GiaTienCong giaTienCong = bLL.LayGiaTienCong(drLoaitien.SelectedItem.Text.Trim(), result, applicationUser.KhachBuon);
		try
		{
			if (giaTienCong.TinhTheoPhanTram)
			{
				tbCong.Text = giaTienCong.TienCong1Mon.ToString();
			}
			else
			{
				tbCong.Text = "0";
			}
		}
		catch
		{
		}
		if (!string.IsNullOrEmpty(drLoaitien.SelectedValue))
		{
			tbTygia.Text = drLoaitien.SelectedValue;
		}
	}
}
