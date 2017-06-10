using System.Windows;
using System.Windows.Input;
using MahApps.Metro.Controls;
using System.Windows.Controls;

namespace StammbaumDerVaganten
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : MetroWindow
    {
        MainViewmodel vm;

        public MainWindow()
        {
            DataContext = MainViewmodel.ActiveVm = vm = new MainViewmodel();

            Load(this, null);

            InitializeComponent();

            if (Keyboard.PrimaryDevice.IsKeyDown(Key.Escape))
            {
                Application.Current.Shutdown();
            }
        }

        private void Load(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Load();
            
            //OnScoutSelectionChanged();
        }

        private void Save(object sender, ExecutedRoutedEventArgs e)
        {
            vm.Save();
        }
    }
}
