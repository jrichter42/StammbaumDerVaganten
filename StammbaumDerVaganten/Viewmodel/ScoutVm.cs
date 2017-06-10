using System;
using System.Collections.ObjectModel;

namespace StammbaumDerVaganten
{
    public class ScoutVm : Viewmodel<Scout>
    {
        protected ObservableCollection<MembershipVm> memberships;
        protected ObservableCollection<ActivityVm> activities;

        public string Forename
        {
            get { return model.Forename.Value; }
            set
            {
                if (model.Forename.Value != value)
                {
                    model.Forename.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Lastname
        {
            get { return model.Lastname.Value; }
            set
            {
                if (model.Lastname.Value != value)
                {
                    model.Lastname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Scoutname
        {
            get { return model.Scoutname.Value; }
            set
            {
                if (model.Scoutname.Value != value)
                {
                    model.Scoutname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime Birthdate
        {
            get { return model.Birthdate.Value; }
            set
            {
                if (model.Birthdate.Value != value)
                {
                    model.Birthdate.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string ContactInfo
        {
            get { return model.ContactInfo.Value; }
            set
            {
                if (model.ContactInfo.Value != value)
                {
                    model.ContactInfo.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Comment
        {
            get { return model.Comment.Value; }
            set
            {
                if (model.Comment.Value != value)
                {
                    model.Comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<MembershipVm> Memberships
        {
            get { return memberships; }
            set
            {
                if (memberships != value)
                {
                    memberships = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<ActivityVm> Activities
        {
            get { return activities; }
            set
            {
                if (activities != value)
                {
                    activities = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ScoutVm() : base()
        {

        }

        public ScoutVm(Scout scout) : base(scout)
        {
            
        }

        protected override void AfterSetModel()
        {
            base.AfterSetModel();

            memberships = new ObservableCollection<MembershipVm>();
            for (int i = 0; i < model.Memberships.Count; i++)
            {
                Membership membership = model.Memberships[i];
                MembershipVm membershipVm = new MembershipVm(membership);
                memberships.Add(membershipVm);
            }

            activities = new ObservableCollection<ActivityVm>();
            for (int i = 0; i < model.Activities.Count; i++)
            {
                ActivityVm activityVm = new ActivityVm(model.Activities[i]);
                activities.Add(activityVm);
            }
        }

        public ActivityVm CreateActivity()
        {
            return ActivityVm.Create(model.Activities, activities) as ActivityVm;
        }

        public MembershipVm CreateMembership()
        {
            return MembershipVm.Create(model.Memberships, memberships) as MembershipVm;
        }
    }
}
