﻿using System;
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
    /// Interaction logic for BasicGroupList.xaml
    /// </summary>
    public partial class BasicGroupList : UserControl
    {
        public BasicGroupList()
        {
            InitializeComponent();
            pfadi_basic_grouplist.ItemsSource = MainViewmodel.ActiveVm.Groups;
        }

        private void pfadi_basic_grouplist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {
            e.NewItem = MainViewmodel.ActiveVm.CreateGroup();
        }

        private void pfadi_basic_grouplist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            ListHelper.DataGrid_CellEditEnding(sender, e);
        }

        private void pfadi_additionalphaseslist_AddingNewItem(object sender, AddingNewItemEventArgs e)
        {

        }

        private void pfadi_additionalphaseslist_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            ListHelper.DataGrid_CellEditEnding(sender, e);
        }
    }
}
