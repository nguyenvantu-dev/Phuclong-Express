using System;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace OrderMan;

public class ucPhanTrang : UserControl
{
	public int intPageIndex;

	public int intTotalItem;

	public int intTotalPage;

	public int intPageSize;

	protected Label lblTotalItem;

	protected Panel LayoutRoot;

	protected ImageButton btnFirstPage;

	protected ImageButton btnPreviousPage;

	protected TextBox txtPageNum;

	protected Label lblTotalPage;

	protected ImageButton btnNextPage;

	protected ImageButton btnLastPage;

	protected Button btnGoPage;

	public event EventHandler PageChanged;

	protected void Page_Load(object sender, EventArgs e)
	{
	}

	private void GotoPage(int pageindex)
	{
		intPageIndex = pageindex;
		this.PageChanged(this, null);
		SetPagerButton();
	}

	protected void btnFirstPage_Click(object sender, ImageClickEventArgs e)
	{
		GotoPage(1);
	}

	protected void btnPreviousPage_Click(object sender, ImageClickEventArgs e)
	{
		if (int.Parse(txtPageNum.Text.Trim()) <= int.Parse(lblTotalPage.Text) && int.Parse(txtPageNum.Text.Trim()) >= 1)
		{
			intPageIndex = int.Parse(txtPageNum.Text.Trim());
		}
		GotoPage(intPageIndex - 1);
	}

	protected void btnNextPage_Click(object sender, ImageClickEventArgs e)
	{
		if (int.Parse(txtPageNum.Text.Trim()) <= int.Parse(lblTotalPage.Text) && int.Parse(txtPageNum.Text.Trim()) >= 1)
		{
			intPageIndex = int.Parse(txtPageNum.Text.Trim());
		}
		GotoPage(intPageIndex + 1);
	}

	protected void btnLastPage_Click(object sender, ImageClickEventArgs e)
	{
		GotoPage(int.Parse(lblTotalPage.Text));
	}

	public void BuildPaging(int PageIndex, int TotalItem, int PageSize)
	{
		if (TotalItem == -1)
		{
			LayoutRoot.Visible = false;
			return;
		}
		LayoutRoot.Visible = true;
		intPageIndex = PageIndex;
		intTotalItem = TotalItem;
		intPageSize = PageSize;
		intTotalPage = (intTotalItem - 1) / intPageSize + 1;
		txtPageNum.Text = intPageIndex.ToString();
		lblTotalPage.Text = intTotalPage.ToString();
		lblTotalItem.Text = "(" + intTotalItem + " biểu ghi)";
		if (intTotalPage == 1 || PageSize == -1)
		{
			LayoutRoot.Visible = false;
			return;
		}
		LayoutRoot.Visible = true;
		SetPagerButton();
	}

	private void SetPagerButton()
	{
		txtPageNum.Text = intPageIndex.ToString();
		if (intPageIndex < intTotalPage)
		{
			btnLastPage.Visible = true;
			btnNextPage.Visible = true;
		}
		else
		{
			btnLastPage.Visible = false;
			btnNextPage.Visible = false;
		}
		if (intPageIndex > 1)
		{
			btnFirstPage.Visible = true;
			btnPreviousPage.Visible = true;
		}
		else
		{
			btnFirstPage.Visible = false;
			btnPreviousPage.Visible = false;
		}
	}

	protected void btnGoPage_Click(object sender, EventArgs e)
	{
		if (int.Parse(txtPageNum.Text.Trim()) <= int.Parse(lblTotalPage.Text) && int.Parse(txtPageNum.Text.Trim()) >= 1)
		{
			GotoPage(int.Parse(txtPageNum.Text.Trim()));
		}
	}
}
