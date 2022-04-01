using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for Scoutlist.xaml
    /// </summary>
    public partial class ScoutList : UserControl
    {
        public ScoutList()
        {
            InitializeComponent();
        }

        private void pfadi_scoutlist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = (DataContext as MainViewmodel).CreateScout();
        }

        private void pfadi_scoutlist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            ListHelper.DataGrid_CellEditEnding(sender, e);
        }
    }
}
