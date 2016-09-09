using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StammbaumDerVaganten
{
    public class GroupPhaseVm : Viewmodel<GroupPhase>
    {
        public GroupType_Type Type
        {
            get { return model.Type.Value; }
            set
            {
                if (model.Type.Value != value)
                {
                    model.Type.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int StartTimepoint_
        {
            get { return model.Timespan.StartTimepoint; }
            set
            {
                if (model.Timespan.StartTimepoint != value)
                {
                    model.Timespan.StartTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("Start_");
                    NotifyPropertyChanged("CustomStart_");
                }
            }
        }

        public int EndTimepoint_
        {
            get { return model.Timespan.EndTimepoint; }
            set
            {
                if (model.Timespan.EndTimepoint != value)
                {
                    model.Timespan.EndTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("End_");
                    NotifyPropertyChanged("CustomEnd_");
                }
            }
        }

        public bool CustomStart_
        {
            get { return model.Timespan.CustomStart_; }
        }

        public bool CustomEnd_
        {
            get { return model.Timespan.CustomEnd_; }
        }

        public DateTime Start_
        {
            get { return model.Timespan.Start.Value; }
            set
            {
                if (model.Timespan.Start_ != value)
                {
                    model.Timespan.Start_ = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End_
        {
            get { return model.Timespan.End.Value; }
            set
            {
                if (model.Timespan.End_ != value)
                {
                    model.Timespan.End_ = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public GroupPhaseVm(ref GroupPhase groupPhase) : base(ref groupPhase)
        {

        }
    }

    public class GroupVm : Viewmodel<Group>
    {
        public GroupType_Type Type
        {
            get { return model.Type.Value; }
            set
            {
                if (model.Type.Value != value)
                {
                    model.Type.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Name
        {
            get { return model.Name.Value; }
            set
            {
                if (model.Name.Value != value)
                {
                    model.Name.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region Timespan
        public Timespan Timespan
        {
            get { return model.Timespan; }
            set
            {
                if (model.Timespan != value)
                {
                    mainPhase.Timespan = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int StartTimepoint_
        {
            get { return mainPhase.StartTimepoint_; }
            set
            {
                if (mainPhase.StartTimepoint_ != value)
                {
                    mainPhase.StartTimepoint_ = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("Start_");
                    NotifyPropertyChanged("CustomStart_");
                }
            }
        }

        public int EndTimepoint_
        {
            get { return mainPhase.EndTimepoint_; }
            set
            {
                if (mainPhase.EndTimepoint_ != value)
                {
                    mainPhase.EndTimepoint_ = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("End_");
                    NotifyPropertyChanged("CustomEnd_");
                }
            }
        }

        public bool CustomStart_
        {
            get { return mainPhase.CustomStart_; }
        }

        public bool CustomEnd_
        {
            get { return mainPhase.CustomEnd_; }
        }

        public DateTime Start_
        {
            get { return mainPhase.Start_; }
            set
            {
                if (mainPhase.Start_ != value)
                {
                    mainPhase.Start_ = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End_
        {
            get { return mainPhase.End_; }
            set
            {
                if (mainPhase.End_ != value)
                {
                    mainPhase.End_ = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public string Comment
        {
            get { return comment.Value; }
            set
            {
                if (comment.Value != value)
                {
                    comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<GroupPhase> AdditionalPhases
        {
            get { return additionalPhases; }
            set
            {
                if (additionalPhases != value)
                {
                    additionalPhases = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region FilteredTimepoints
        public ObservableCollection<Timepoint> FilteredTimepoints
        {
            get { return model.MainPhase.FilteredTimepoints; }
        }
        #endregion


        public GroupVm(ref Group group) : base(ref group)
        {

        }
    }
}
